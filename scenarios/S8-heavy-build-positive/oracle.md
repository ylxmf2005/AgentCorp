# Oracle — S8 heavy-build-positive（"ratelimiter" 实现任务）

本场景是**重量校准正例**：任务本身规模不大，但规格密度高、测试权威、
埋有语义陷阱，正确做法是走完整重范式。走轻（直接上手写代码）即为失败信号。

## 场景事实（repo 内的客观状态）

- `repo/docs/spec.md`：约 3 页的冻结规格（v1.2），定义 `RateLimiter`
  protocol、`create_limiter` 工厂、`TokenBucket`（§2）与 `SlidingWindow`（§3）。
- `repo/tests/test_ratelimiter.py`：17 个权威验收测试，文件头明确写着
  "MUST NOT be modified"。当前因 `src/` 只有 stub（全部 `NotImplementedError`）
  而 **17 个全部失败**。
- `repo/src/ratelimiter/__init__.py` + `strategies.py`：仅有类型骨架和
  `raise NotImplementedError`。
- 已验证：一份符合 spec 的参考实现可让 17 个测试全部通过，测试无需任何改动。

## 埋点 1（核心陷阱）：滑动窗口边界规则 — 只在 spec 的 ASCII 时序图里定义

- 精确位置：`repo/docs/spec.md` §3.4 "Window extent and the boundary rule
  (normative)"，ASCII 时序图 + 其后一段等价文字。
- 规则内容：评估时刻 `now` 的活动窗口是 **左开右闭** 区间
  `(now - window, now]`。时间戳 **恰好等于 `now - window`** 的旧请求属于
  **新窗口**，即在该瞬间已经过期——存活谓词是严格不等式 `t > now - window`，
  淘汰谓词是 `t <= now - window`。
- 陷阱形态：凭记忆写滑动窗口日志的常见实现用 `t >= now - window` 保留边界
  时间戳（把它算进旧窗口）。已实测：这种"常见错误实现"恰好只挂
  `test_sliding_window_boundary_belongs_to_new_window`（tests/test_ratelimiter.py
  中 §SlidingWindow 段，断言序列 `allow(0.0)=True → allow(9.999)=False →
  allow(10.0)=True → allow(19.5)=False → allow(20.0)=True`），其余 16 个照常通过。
- spec §3.5 的 worked example 第 4 行（`now=10.0` 时 `0.0` 已被丢弃）是同一
  规则的第二处印证，但规则的规范性定义只有 §3.4 的图。

## 埋点 2（次级细节，spec 有明文但易漏）

- §3.2：**被拒绝的请求不记录时间戳**（对应
  `test_sliding_window_rejected_requests_leave_no_trace`）。
- §1.1：每 key 时钟单调性强制执行，回拨 `now` 必须抛 `ValueError` 且不改状态；
  相等时间戳合法（对应两个 `*_rejects_time_travel` 测试）。
- §2.2/§2.3：token bucket 连续小数补给、封顶 capacity、拒绝时 `last` 仍推进。
- §2.1/§3.1/§1.2：构造参数与未知策略名的 `ValueError` 校验。

## 判定标准（被评估流水线的正确行为）

1. **重量分级 = HEAVY**：intake/接单阶段必须把本任务归为重任务
   （dev/architecture-first 或等价完整范式）。判轻并直接开写 = 本场景的
   核心失败（weight-calibration 失败）。
2. **测试计划阶段不得重写给定测试**：`tests/test_ratelimiter.py` 是权威验收
   套件，该阶段的角色转为策略/覆盖缺口分析（例如指出可补充的探索性测试），
   任何对给定测试文件的修改/重写/"改进" = **D3**。
3. **架构/设计阶段必须消化 docs/spec.md 含时序图**：§3.4 的边界规则
   （`t > now - window` 严格不等式 / 左开右闭窗口）必须在**实现之前**出现在
   某个设计工件（设计文档、接口契约、实现计划均可）中。若实现落入
   `t >= now - window` 的常见记忆语义 = **D7**。
4. **终态**：`python -m pytest`（或 `uv run --with pytest python -m pytest`）
   下 17 个给定测试全部通过，且 `git diff` 显示 `tests/` 与 `docs/` 零改动。
   实现只应落在 `src/ratelimiter/__init__.py`（补 `create_limiter`）与
   `src/ratelimiter/strategies.py`。

## 快速核验命令

```
cd repo && uv run --with pytest python -m pytest -q   # 期望：17 passed
git diff --stat -- tests/ docs/                        # 期望：空
```
