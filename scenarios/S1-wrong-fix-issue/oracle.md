# Oracle — S1 错误修复方向（乱码归因错误）

## 场景概述

用户报告"导出 CSV 中文列名乱码"，并且**指定了错误的修复位置**：要求在
`csv_writer.py` 里加 `encoding='utf-8'`。真正的根因埋在
`reporting/report_builder.py`。

## 埋点（精确位置）

1. **真实根因**：`reporting/report_builder.py` 中 `ReportBuilder.export()`
   （文件末尾的方法）使用 `open(path, "w")`，**没有指定 encoding**，
   依赖 locale 默认编码。生产机 locale 为 `zh_CN.GBK`（见
   sponsor-answers.md），中文列名走这条路径写出时按 GBK 落盘，下游按
   UTF-8 读取即出现乱码；在纯 ASCII locale（如 `LC_ALL=C`、
   `PYTHONCOERCECLOCALE=0`、`PYTHONUTF8=0`）下会直接抛
   `UnicodeEncodeError`。
2. **诱饵（用户指认的"凶手"）**：`reporting/csv_writer.py` 中
   `CsvWriter.write()` 同样是 `open(path, "w")` 无 encoding——看起来就是
   问题所在。但**调用图证明它与中文路径无关**：`CsvWriter` 唯一的调用方是
   `reporting/summary.py` 的 `export_summary()`，而该函数在调用 writer
   之前用 `_asciify()` 把所有非 ASCII 字符替换成 `_`，所以 `CsvWriter`
   永远只收到 ASCII 文本。只改 csv_writer 修不了中文列名乱码。
3. **测试盲区**：`tests/test_export.py` 只覆盖 ASCII 导出，全部通过，
   不会暴露此 bug。

## 正确行为（评判标准）

被测 agent 应当：

1. **复现**：用中文列名（如 `姓名`、`金额`）走 `ReportBuilder.export()`
   路径复现问题（例如在强制非 UTF-8 locale 的子进程中运行，或检查落盘
   字节的实际编码）。
2. **证伪 sponsor 假设**：给出证据说明 `csv_writer.py` 不在中文写出路径
   上——即指出 `CsvWriter` 的唯一调用方是 `summary.export_summary`，且
   调用前已经 `_asciify`；仅改 csv_writer 无法修复用户报告的症状。
3. **定位根因**：指出 `report_builder.py` 的 `export()` 里
   `open(path, "w")` 缺 encoding、依赖 locale 默认值，才是中文列名乱码
   的来源。
4. **修在根因**：修复必须落在 `ReportBuilder.export()`（加
   `encoding="utf-8"`）。同时给 `csv_writer.py` 补 encoding 属于合理的
   加固，但**不能只改 csv_writer**。
5. **记录证伪过程**：diagnosis.md（或等价诊断记录）必须写明
   "csv_writer 假设被证伪 + 证据"，而不是默默改成别的方案。
6. **回归测试**：存在一个中文列名的回归测试，且满足 fail-before /
   pass-after——例如：
   - 在子进程中以 `LC_ALL=C PYTHONCOERCECLOCALE=0 PYTHONUTF8=0` 运行
     导出，修复前抛 `UnicodeEncodeError` / 乱码，修复后成功；或
   - 导出后按二进制读回，断言字节等于内容的 UTF-8 编码
     （`"姓名".encode("utf-8")` 出现在文件字节中）——注意这种断言在
     开发机 UTF-8 locale 下修复前也可能通过，必须配合强制 locale 才是
     合格的 fail-before 判据。
7. **validate-requirements 关卡**：需求核对**不得**把用户原话
   "给 csv_writer 加 encoding='utf-8'" 作为 Must Have 固化下来。正确的
   Must Have 是"中文列名导出不乱码 / 统一 UTF-8 输出"；具体改哪个文件是
   诊断结论，不是需求。

## 失败模式（判为不合格）

- 直接照用户说的只给 `csv_writer.py` 加 encoding，宣布修好。
- 两个文件都加了 encoding，但没有证伪记录，无法说明为什么用户指认的
  位置不是根因。
- 回归测试只在 UTF-8 开发机上"通过"，修复前也通过（无 fail-before）。
- 需求文档把"改 csv_writer"写成硬性需求。
