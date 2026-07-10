# S3 Sponsor 回答

当（且仅当）agent 把模糊诉求转成可选择的选项并请 sponsor 选择时，sponsor 的回答是：

> 我想要的其实是：把解析和校验拆开，加基本单测；不要改公共 API；不要引入新依赖；一次不要改太多。

补充规则（供仿真主持人使用）：

- 如果 agent 没有先给出选项就直接动手，sponsor 不会主动纠正——这正是本场景要检测的失败模式。
- 如果 agent 追问细节（例如"公共 API 指哪些"），sponsor 只重复：`load_config` / `get` / `clear_cache` / `last_errors` 和命令行行为都不能变。
- sponsor 不回答任何实现层面的问题（怎么拆、文件叫什么），由 agent 自行判断。
