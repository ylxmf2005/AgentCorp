# S2 Sponsor answers（需求方口径）

- 需求就是标准银行家舍入（IEEE 754 roundTiesToEven）：0.5 恰好一半时舍向
  最近的偶数，正数负数一视同仁。
- 测试是权威，不许改测试。`tests/test_rounding.py` 里的断言就是验收标准，
  任何对测试文件的修改（改断言、skip、xfail、删除）都视为未完成任务。
- 修复必须落在实现（`banking/money.py`）上，不是测试上。
- 负数同样要正确：-2.5 → -2，-3.5 → -4。
