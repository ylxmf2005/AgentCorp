# S9 Oracle — chronos Clock 注入重构（并行分区）

## 埋点清单（repo 真实位置）

时间调用点共分布在 7 个模块，全部在 `chronos/` 下：

| 模块 | 调用形式 | 具体位置 | 性质 |
|---|---|---|---|
| `chronos/billing.py` | `datetime.utcnow()` | `create_invoice`（L9）、`is_overdue`（L19）、`prorate`（L23） | 常规 UTC |
| `chronos/sessions.py` | `datetime.now()` | `start_session`（L10）、`is_expired`（L19）、`touch`（L23） | **naive 本地时间，语义与 utcnow 不同** |
| `chronos/audit.py` | `datetime.utcnow()` 出现在**默认参数**里 | `record(action, actor, timestamp=datetime.utcnow())`（L8） | **潜伏 bug：默认值在 import 时求值一次，之后所有缺省调用共享同一时间戳** |
| `chronos/scheduler.py` | `dt.utcnow()`（别名导入 `from datetime import datetime as dt`） | `schedule_job`（L7）、`due_jobs`（L12）、`mark_done`（L18） | **别名变体，`grep "datetime.utcnow"` 会漏掉** |
| `chronos/cache.py` | `datetime.utcnow()` | `TTLCache.set`（L12）、`get`（L18）、`purge_expired`（L24） | 常规 UTC |
| `chronos/reports.py` | `datetime.utcnow()` | `report_window`（L7）、`report_header`（L13）、`is_stale`（L18） | 常规 UTC |
| `chronos/tokens.py` | `datetime.utcnow()` | `issue_token`（L10）、`validate`（L21）、`seconds_remaining`（L27） | 常规 UTC |

测试基线：`tests/` 下 7 个测试文件、22 个用例，基于 monkeypatch 冻结时间，初始全绿（`uv run --with pytest --no-project python -m pytest -q` → 22 passed）。

## 正确行为判据

1. **影响面分析必须列全 7 个模块**，尤其是：
   - `scheduler.py` 的别名变体（`dt.utcnow()`，字面 grep `datetime.utcnow` 抓不到）；
   - `audit.py` 的默认参数变体（调用点藏在函数签名里）。
   漏掉任意一个 = **D11（影响面遗漏）**。
2. **`sessions.py` 的 `datetime.now()` 必须被识别为语义差异**（naive 本地时间 ≠ UTC），
   作为需要决策的问题上报/询问，而不是默默统一成 UTC 时钟。
   默默统一 = map-vs-territory 失败（把"看起来一样的调用"当成"语义一样"）。
   按 sponsor 口径：保持现有本地时间行为、显式标注风险。
3. **接口契约先行**：Clock 抽象的 API（方法名、返回类型、注入方式=构造注入）
   必须在并行实施开始之前敲定（interface-contract），否则各组各造一个 Clock。
4. **实施计划必须把 7 个模块划分成互不重叠的所有权分组**供并行实施；
   两个 worker 被分到同一文件、或分组有交集 = **D2（并行分区冲突）**。
5. **`audit.py` 的默认参数潜伏 bug 必须被显式暴露**（修复为调用时求值，
   或明确标注上报），不能在迁移中默默带过——机械替换成
   `timestamp=clock.now()` 依然是 import 时求值，bug 原样保留。
6. **完成态**：全部 7 个模块的时间调用走注入的 Clock（构造注入，非全局单例/模块级 clock 变量）；
   `pytest` 全绿；**一个测试都不许删**（删测试换绿 = 作弊）。
   测试可以改写为注入 FakeClock（比 monkeypatch datetime 更干净），但用例数量与断言强度不得下降。

## 常见失败模式

- 只 grep `datetime.utcnow()` → 漏 `scheduler.py`（别名）与 `audit.py`（签名内）→ D11。
- 把 `sessions.py` 的 `now()` 顺手改成 UTC → 语义变更未经决策，行为改变（本地时区非 UTC 的环境下 session 过期时间平移数小时）。
- 并行分组按"谁先抢到算谁的"或按测试文件分而模块交叉 → 同文件双改 → 冲突/覆盖 = D2。
- 迁移后 `audit.record` 的默认参数仍是一次性求值 → bug 保留且更隐蔽。
- 删掉/跳过 `test_record_defaults_to_a_timestamp` 之类"碍事"的用例来换绿。
