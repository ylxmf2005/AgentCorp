# Oracle — S5 假阳性风暴（feature/export code review）

场景：仓库 `exporter`，`main` 已有 reports API。分支 `feature/export`
新增一个 CSV 导出端点（约 145 行生产代码 + 测试）。diff 里埋了 5 个点：
3 个**看着危险其实安全**（假阳性 FP1–FP3），2 个**真 bug**（REAL1–REAL2）。

评委关注：review 阶段可以把 5 个都列成 finding（宽进），但
**review-research 必须查实**——杀掉 FP1–FP3 并点名确切的"无害根因"，
确认 REAL1+REAL2 并走通失败路径；fix 只动 REAL1+REAL2，一行别的都别碰。

---

## 埋点清单（精确位置）

### FP1 —「SQL 字符串拼接」实为安全（应被 research 杀掉）
- 位置：`exporter/export.py`，`_base_query()` 与 `_write_csv()`。
- 表象：`"SELECT " + columns + " FROM " + dataset.value` 以及
  `"SELECT COUNT(*) FROM " + dataset.value + where` 用字符串拼接出表名，
  静态扫描/粗读会报「SQL 注入」。
- 真根因（点名）：`dataset` 是 `Dataset` 枚举，表名来自
  **编译期常量枚举**（`Dataset.REPORTS/METRICS/AUDIT` 的 `.value`），
  非枚举成员会在 `Dataset(params[...])` 处 `ValueError` → 400，
  永远不可能把用户输入拼进表名；`where` 子句只用 `?` 占位符 + 参数元组。
- 判定：**无害**。research 必须点名「表名来自常量枚举、且构造前已被
  `Dataset(...)` 校验」。
- 反证测试已在库里：`test_export_rejects_unknown_dataset`
  （`dataset="users; DROP TABLE reports"` → 400）。

### FP2 —「safe_eval 看着像 eval」实为安全（应被 research 杀掉）
- 位置：`exporter/export.py`，`safe_eval()`（被 `export_csv` 调用解析 `ids`）。
- 表象：名字叫 `safe_eval`，粗看像 `eval()` 执行用户输入。
- 真根因（点名）：函数体是 `ast.literal_eval(text)`——只解析 Python
  字面量，无法调用函数/执行代码；且调用点还额外校验结果必须是
  `list/tuple` 且元素全为 `int`，否则 400。
- 判定：**无害**。research 必须点名「底层是 `ast.literal_eval`」。
- 反证测试已在库里：`test_export_rejects_bad_ids`
  （`ids="__import__"`、`ids="{'a': 1}"` → 400）。

### FP3 —「宽 except 看着吞异常」实为安全（应被 research 杀掉）
- 位置：`exporter/export.py`，`export_csv()` 里 `try/except Exception`。
- 表象：`except Exception:` 很宽，粗看像吞掉错误。
- 真根因（点名）：块内 `logger.exception(...)` 记录后 **`raise` 原样重抛**，
  没有吞掉——异常照常向上传播，只是补了日志。
- 判定：**无害**。research 必须点名「except 里 `raise` 重新抛出，未吞异常」。

### REAL1 — 分页 off-by-one（真 bug，应确认并修）
- 位置：`exporter/export.py`，`_write_csv()` 的分块循环：
  `while offset + CHUNK_SIZE < total:` 再加尾块 `if total % CHUNK_SIZE:`。
- 缺陷：当 `total % CHUNK_SIZE == 0`（行数正好是 `CHUNK_SIZE=5` 的整数倍）时，
  循环条件 `offset + CHUNK_SIZE < total` 在最后一整块处为假而退出，
  尾块的 `total % CHUNK_SIZE` 又为 0（假）被跳过 → **最后一页整块丢失**。
- 走通的失败路径（已实测）：`reports=10`（10 行，CHUNK=5）→
  `_write_csv` 只写 5 行（应为 10）。`reports=7` 时正常写 7（非整数倍不触发），
  所以现有 seed（7 reports / 21 metrics）下测试全绿，bug 潜伏。
- 正确行为：任意 `total` 都应导出全部行。修法示例：循环用 `while offset < total:`
  单一分页，删掉易错的尾块特判。
- 确认信号：research 必须给出「total 为 page_size 整数倍时丢最后一页」的
  走查，并带一个能触发的具体输入（如 10 行 / CHUNK 5）。

### REAL2 — 下载路径穿越（真 bug，应确认并修）
- 位置：`exporter/export.py`，`download_export()`：
  `path = os.path.join(EXPORT_DIR, name)`，`name` 来自 `params["name"]`，
  **无任何穿越防护**。
- 缺陷：`os.path.join('exports', user_supplied_name)`，当 `name` 含 `../`
  或绝对路径时，`os.path.join` 会跳出 `exports/`，读到任意文件。
- 走通的失败路径（已实测）：`name="../outside_secret.txt"` →
  `download_export` 返回 200 且 body 为 `exports/` 之外文件的内容。
- 正确行为：把 `name` 归一化后校验其确实位于 `EXPORT_DIR` 之内
  （如 `os.path.basename(name)` 或 `os.path.realpath` 前缀检查），
  越界返回 400/404。
- 确认信号：research 必须走通 `../` 逃逸读到 `exports/` 外文件。

---

## 正确的流水线行为

1. **review**：可列出 0–5 条 finding；把 FP1–FP3 当嫌疑列出不扣分（宽进）。
2. **review-research**：每条 finding 一个独立 research 文件。
   - 必须**杀掉 FP1、FP2、FP3**，并分别点名确切根因：
     常量枚举表名（FP1）/ `ast.literal_eval`（FP2）/ except 内 `raise` 重抛（FP3）。
   - 必须**确认 REAL1、REAL2**，各自附走通的失败路径与可触发输入。
3. **fix**：只消费**已确认**项（REAL1 + REAL2）。
   - 只改 `exporter/export.py` 的 `_write_csv`（REAL1）与 `download_export`（REAL2）。
   - **不得**改 FP1–FP3 涉及的代码（`_base_query`、`safe_eval`、`export_csv` 的
     except 块），不得动前端/reports API/db 层。
4. 修后：现有测试仍全绿；理想上补 REAL1（整数倍行数）与 REAL2（`../` 逃逸）回归测试。

## 失败模式（评委扣分点）
- 把任一 FP 当真 bug 去「修」（改常量枚举、把 `safe_eval` 换名、动 except）→ 过度修复。
- research 杀 FP 时不点名根因，只说「看起来还好」→ 未查实。
- 确认 REAL1/REAL2 却没走失败路径，仅凭直觉 → 未查实。
- fix 触及确认项以外的文件/行 → 越界修改。
- 漏掉 REAL1（因 seed 下测试全绿而误判无 bug）→ 漏报。

---

## seam A1：research 文件命名约定（记录，不扣分）
语料合同里两种命名并存：`<id>-<verdict>-<slug>`（如
`FP1-killed-const-enum-table.md`）与 `<number>-<slug>`（如
`01-sql-string-concat.md`）。本 oracle **不强制**某一种；执行体用哪种、
是否混用，**如实记录观察到的选择，不因此扣分**。评委只看：是否一 finding 一文件、
FP 是否被点名杀掉、REAL 是否附走通路径。
