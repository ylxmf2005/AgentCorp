# 研究包：当研究必须亲自动手时

一份报告说"这个 SDK 能用"，和一份你实际安装过、跑起来过、且运行日志就留在磁盘上的记录，是两种完全不同的证据。只要一个决策依赖于对"能不能跑 / 集成效果怎么样"的研究，交付物就不该只是一份报告——它应该是一个**研究包**：报告只是入口和索引，文件夹里放着可复现的实验、本地抓取的官方文档，以及基于实证的选型结论。下游的 architect 或 engineer agent 直接消费这个文件夹，不用重新搜索，也不用再踩一遍同样的坑。

## 三层深度

按决策类型设定深度，别每次都跑满：

- `desk`：纯认知层面的问题（领域格局、概念厘清、市场扫描）。产出一份报告。
- `source-verified`：结论取决于某个说法是否属实。在 `desk` 基础上增加 source-level verification（见 research-method.md）。
- `hands-on`：决策取决于"能不能跑 / 集成成本多大 / 选哪个 SDK"。产出完整的研究包。

如果任务指名了深度，就按它来；没指名的话，自己按上面标准定，并在 Research Brief 里记录深度和理由。拿不准的时候问自己：读报告的人下一步是不是"找个人试试"？如果是，那现在这个"试试"就该你来做。

## 目录骨架

```
research/<topic-slug>/
├── 00-report.md              # 决策报告（骨架见 research-method.md），整个包的唯一入口
├── experiments/
│   ├── README.md             # 实验索引：一行一个实验（问题 / ✅❌⏱ / 一行结论）
│   └── exp-01-<slug>/        # 编号 + 短名；一个实验回答一个问题
│       ├── NOTES.md          # 见"实验纪律"
│       ├── env/              # requirements.lock.txt + ENV.md（Python/SDK 版本、可复制粘贴的安装命令）
│       ├── src/              # 实验代码，一条命令即可重新运行
│       └── runs/run_01/      # output.log + meta.json + 本次运行的代码快照
└── docs-snapshot/
    ├── INDEX.md              # 见"文档快照"
    └── <按主题分块的 .md 文件>
```

按需裁剪：没跑实验就没有 `experiments/`，没抓文档就没有 `docs-snapshot/`，但只要存在，就必须符合本文件里的约定。

## 实验纪律

- **先写问题**：动手之前，先在 `NOTES.md` 里写下 `QUESTION`（这个实验回答什么）、`SUCCESS CRITERIA`（怎样算成功）、`TIMEBOX`；跑完之后补上 `ANSWER` 和关键输出的摘录。一个用一段话总结不了的实验，不算做完。
- **单命令复现**：每个实验必须一条命令就能重新跑起来（例如 `python src/main.py`），没有隐藏步骤；用 `pip freeze` 把环境锁进 `env/requirements.lock.txt`，Python 版本和安装命令记在 `env/ENV.md` 里。一个完全没读过本任务上下文的新 agent，仅凭这个目录就能复现结果——这才是有效实验的及格线。
- **先跑 baseline**：先把官方 quickstart / hello-world 原样跑起来，作为 run_01，然后再搭贴近本任务场景的变体。baseline 跑不通，后面全是空中楼阁。
- **留下输出痕迹**：用 `tee` 把运行输出实时落盘到 `runs/run_NN/output.log`，报告里只引摘录 + 指针——绝不凭记忆转述；`meta.json` 记录 `{command, exit_code, duration_s, verdict: ok|failed, analysis}`；每次有意义的运行，都要把当时的实验代码快照打进运行目录（agent 会在多次运行之间改代码，没有快照就追不到哪版代码产出了哪个结果）。
- **失败是一等交付物**：安装失败、跑不起来、版本冲突的运行记录不要删——目录名直接带上原因（例如 `run_02-fail-version-conflict/`）。"我们试了 X，没跑通，因为 Y" 对下游决策的价值，往往不比成功案例低。
- **硬性预算**：同一个错误修了 3 次还没解决，就换路（换安装方式、换版本、换示例），别在死胡同里把预算烧光；TIMEBOX 到了就必须把结论落盘，哪怕是"没跑起来，卡在 X"。
- **实验代码只用于验证**：在 `experiments/README.md` 里标明"仅供验证，非生产质量"。它的任务是回答问题，不是交付上线。

## 执行边界

阅读证据和运行实验是两个区域，红线不同：

- **证据阅读区**（别人的 clone 下来的 repo）：只读——不执行它的任何脚本、setup.py 或 CI 配置。
- **实验区**（你自己写的代码 + 从官方 registry 安装的依赖）：可以执行，但只能在隔离的 venv 或临时目录里跑，不污染系统环境；依赖只能从官方 registry（PyPI/npm 等）安装，安装前核对包名拼写（typosquatting 是真实攻击面）；不使用任何 production 凭证，不访问任何 production 系统；收尾时清理实验产生的所有进程。

## 文档快照

目标是让下游 agent 离线消费"这次决策需要的那片文档"——不是镜像整个站点。分三层抓取：

1. 先探 `https://<docs-domain>/llms.txt`（注意它可能挂在 docs 子域名下）。命中了就存盘作为索引，按需抓取单页——很多站点支持给 URL 加 `.md` 后缀直接拿干净 markdown，优先试这个通道。
2. 文档源码在 repo 里（常见 mkdocs/docusaurus/sphinx）：`git clone --filter=blob:none --sparse` 只拉 `docs/`，并 checkout 与你研究版本对应的 tag。自行判断：`docs/` 里的 `.md` 文件打开能直接读，就用；如果全是模板指令和 autodoc 占位符，放弃这一层，进下一层。
3. 只有渲染后的站点：少量页面用 `curl -s "https://r.jina.ai/<page-URL>"` 逐页转 markdown；整棵子树用 crawl4ai 这类本地工具。
4. 绝不用 wget/httrack 做整站 HTML 镜像——HTML 噪音会爆 token，下游 agent 也没法用。

`INDEX.md` 是快照对下游的约定，必须包含：source URL、repo 和 version/commit、capture 日期、capture 方法、文件清单（每文件一句话）、**显式的"未包含内容"**（防止下游误以为快照是完整集合）、已知缺口。

## 三种断言状态

在 `00-report.md` 的 Findings 中，给每个 capability assertion 打上证据级别标签：

- **Verified**：附上运行证据指针（`experiments/exp-01-*/runs/run_01/output.log`）。
- **Verification failed**：试过了，没跑通——附上失败运行的指针和原因。
- **Unverified**：仅来自文档或源码阅读，未实际运行。

像"这个 SDK 支持 X"这种话，如果出现在推荐依据里却没有标签，那就是包装过的猜测，冒充事实。

## 晋升到 Teamspace

研究包默认归属当前任务。收尾时判断一次：文档快照或某个实验结论对**下一个不同的任务**是否有复用价值（同一技术大概率还会再出现）？如果有，把相关部分拷到 `teamspace/knowledge/<tech>/`，并在其 INDEX.md 里注明来源任务和日期；复用 learnings 的去重规则——先检查 `teamspace/knowledge/` 里是否已有旧快照，重合度高就更新旧版，而不是另起炉灶。反过来，**每次启动研究任务时，先检查 `teamspace/knowledge/`**；命中了，确认版本还新鲜，就直接复用，省一轮抓取。

## 交付前自检（研究包部分）

- `experiments/README.md` 索引覆盖每个实验目录；每个实验的 NOTES.md 都填了 ANSWER。
- 每个实验都能单命令复现，环境完全锁定；每次失败运行都已归档。
- 报告里的每个 capability assertion 都带了三态标签；每个 "Verified" 都有可点击的日志指针。
- `docs-snapshot/INDEX.md` 的约定字段完整，且说明了"未包含内容"。
- 已做 teamspace-promotion 判断（报告 Follow-Up 附近写一行：晋升了什么，或为什么没有）。
