# Testing-context document (testing-context)

项目级别的运行时 facts 台账，固定路径是 `teamspace/testing-context.md`。它存在的理由是：test plan 不够具体，根因几乎一定是 planner 不知道系统入口在哪、怎么登录、页面长什么样、数据遵循什么约定。这些 facts 在不同 task 之间是稳定的——花一次功夫摸清，写下来，之后每个 task 的 planning 都站在它上面。

"自由探索一个产品，把它蒸馏成可复用的文档"是一件讲方法的事，不是随机乱点。下面的流程融合了两条成熟的实践脉络——人类的探索式测试学科（charters、tours）和 agent 自主探索研究（frontier、novelty constraint、verification markers）——所以请按步骤走。

## 它必须回答什么

一份足够好的 context 文档，能让一个从来没碰过这个项目的人回答出：

- **Entry and access** — 每个环境（pre/test/formal）的入口 URL；登录方式（已登录的浏览器 session、account 系统、credential 引用——只引用，绝不要放 secret）。
- **Page map** — 主要页面/视图有哪些，彼此之间怎么跳转；每个页面承载的核心操作是什么。
- **Core user flows** — 这个产品的用户通常做什么：从哪进入，几步完成，什么算结束。
- **Observable surface** — 除了页面之外，还能从哪收集证据：API endpoint 的形态、数据库（怎么连、只读约束）、日志（怎么查、去哪看）。
- **Test-data conventions** — 现成的测试账号/项目/数据集；创建数据的安全方式；哪些数据绝对不能碰。
- **Known limitations** — 环境差异（比如 service routing、pool 切换）、常见的阻塞场景、之前踩过的坑。
- **Gaps to fill** — 还没走到、还没录入的部分，留给下一次增量探索。

## 探索用的工作文件

探索是产出 artifact 的活，不是脑子里想想。开始之前，在当前 task 目录下创建 `test/exploration/`，里面放四样东西：

| 文件 | 是什么 | 模板 |
|---|---|---|
| `frontier.md` | 待探索清单：看到但还没进入的入口/页面/线索 | `references/templates/exploration-frontier.demo.md` |
| `charters.md` | Charter 台账：每一轮的目标陈述，以及沿途发现的、转成待办的事项 | `references/templates/exploration-charters.demo.md` |
| `journal.md` | 探索日志：每一轮实际走了什么，证据在哪 | `references/templates/exploration-journal.demo.md` |
| `shots/` | 截图目录 | 编号为 `NN-<slug>.png`，在 journal 里按名字引用 |

从 demo 里拷结构，替换成当前项目的内容。这四样是 task artifact，留在 task 目录里作为探索证据。只有确认无误的结论才写回 `teamspace/testing-context.md`（结构参考 `references/templates/testing-context.demo.md`）。

## 怎么探索：步骤

**Step 0 Initialize（先不开浏览器）**
创建上面四个工作文件。读现有材料：`teamspace/learnings/`、之前 task 的测试 artifact、项目文档/README、代码里的路由表和 handler 注册。把你读的每一个种子都记下来：声称的功能和入口点进 `frontier.md`；接口形态和日志/数据库证据路径直接写进 testing-context.md 里 "Observable surface" 的初稿。

**Step 1 Set a charter**
从 `frontier.md` 里挑一个还没探索的项（挑选规则见下面的 "Advancement strategy"），按模板写进 `charters.md`，标记为 `in-progress`：

> Explore <target area>, using <means/resource>, to find out <which kind of information to write into the document>.

示例："Explore the asset-library list page, using the already-logged-in Chrome session, to find out the entry path, the operations visible on the list page, and the way to navigate to the detail page." "to find out" 这个字段强制你在出发前就确定要带什么回来——这是防止探索变成闲逛的第一道缰绳。

定 charter 时守住三条规则：(1) 先扫一遍文档和 journal 已经覆盖了什么；新的 charter 必须跟已探索的明显不同，不能是对已知内容的重复确认；(2) 目标必须可验证——你出发 "to find out" 的东西必须能用页面证据确认，不能提出超出当前权限/环境范围的问题；(3) 不要为一个单击定 charter——优先选跨多步的目标，或涉及 create/read/update/delete、过滤等操作；单个控件的行为可以顺路检查。

**Step 2 Execute**
带着浏览器走 charter。每一步：截图存进 `shots/`，在 `journal.md` 里记一行——"page → action → observation"。沿途看到的新入口点追加到 `frontier.md`（只记录，不进入）；side findings（可疑行为、未见过的功能）写进 `charters.md` 并标记为 `pending`，当场不深挖。

**Step 3 Harvest**
本轮结束后，把确认的事实写进 `teamspace/testing-context.md` 的对应 section，按归属排序（格式见 "How to record"）。在 `frontier.md` 里把那项标为 `[x]`，charter 标为 `done`。

**Step 4 Decide whether to stop**
对照下面的停止条件检查。没有一个满足的话，回到 Step 1 挑下一项。

**Step 5 Wrap up**
做一次自检：testing-context.md 的哪些 section 还是空的或薄的，哪些入口被挡住了进不去，哪些条目你信心不足——如实写进它的 "Gaps to fill" section。把整个 `exploration/` 目录留在 task 里，不要删。

## Advancement strategy（Step 1 怎么挑）

探索有两种节奏，挑选规则不同：

1. **Map-laying phase，breadth-first** — 目标是搭出 page map。每一轮挑一个没访问过的页面，只看一层：记录 URL、用途、页面上可见的核心操作、能跳到哪（出边）；所有新链接进 frontier，本轮不深入。frontier 里没有未访问页面时，map-laying 完成。
2. **Line-walking phase，depth-first** — 目标是 core user flows 和 data conventions。每一轮挑一个完整的用户目标（从哪进入，几步完成，什么算结束），一路走到头，不分支；把分叉记进 frontier 或 charters，稍后再回来。走线的同时，跟踪一个核心数据对象：它出现在哪些页面/接口/表里。

顺序是固定的：先铺 map，再走线——没有 map，挑哪条线走就是瞎蒙。整个过程里，留意 permission wall、环境差异、解析不了的页面，随手记进 "Known limitations"。

## Exploration discipline

- **用真实的、已登录的 session** — 遇到登录墙时，先确认你驱动的是用户已经登录的浏览器实例，不是新开的空白页；确认后还是被挡，把这个分支记进 "Known limitations" 并停在这里，不要编造墙后面是什么。
- **先只读** — 随意浏览、查看、截图；exploration 期间不执行创建/修改/删除业务对象、不对外发送、不花钱——从页面控件和代码里推断步骤，并标记为 "not actually tested"。
- **Exploration 是你自己的活，不能甩出去** — task 约束里的 "do not execute tests" 和 "do not call write interfaces" 限制的是写操作和验证执行；**这不是把浏览器关上的理由**：只读地浏览页面、检查结构、截图 *就是* planning-time exploration 的主体。把 map-laying 和 line-walking "留给 verify-phase 的 tester 去填" 是失职——tester 拿到的那本 manual 应该站在你已经验证过的 page map 之上，而不是替你探路。如果环境确实连不上（登录过期、服务没起），按上面 "Use the real, already-logged-in session" 的规则记为 known limitation；那叫 blocked，不叫 delegation。
- **卡住就换办法，不要原样重试** — 某一步失败（点不了、没反应），换条路达到同一目标（不同的入口、不同的控件、切到导航）；不要逐字重复失败的动作；每一步只做完成该步所需的最小动作，不要顺手多点。
- **失败也是 fact** — 页面打不开、走了错路——如实记进 "Known limitations"，或者记成那条路 "actually leads to X"。注意区分两种情况："我没走通" 和 "产品本身就没有这个功能/信息"——后者本身就是有效发现，如实记录，不是失败。绕着它编一个顺滑版本是在污染文档。

## When to stop

满足以下任意一条，就进入 Step 5 wrap-up：

1. testing-context.md 的每个 section 都有了非空的、核对过的内容，且 frontier 里剩下的项明显都是次要的；
2. 连续两三轮探索都没有给文档带来新增量；
3. 预算（步数/时间）耗尽。

给下一个 task 的增量探索留好 gap，不要硬填。

## How to record（写回 testing-context.md 时）

Section 和 entry 的结构遵循 `references/templates/testing-context.demo.md`。写的时候守住这些判断规则：

- **Page map 记成 transitions** — "page A --<action>--> page B"，每页一行：URL pattern、用途、承载的核心操作。比大段文字更好检索、更好核对。
- **每条 flow 带上 preconditions 和 provenance marker** — 前置状态（要不要登录、需不需要先存在某些数据）、分步动作、以及它是 `actually walked` 还是 `inferred from code`。读的人据此判断可信度。写通用情况，而不是某次跑出来的具体值：变量部分用 `{descriptive name}` 占位（比如 `{asset name}` 而不是某个具体 ID），固定的 UI 文本原样保留（按钮名、菜单名）。
- **重复的子序列抽成 subflow** — 当同一段步骤在多条 flow 里反复出现（比如登录、进入某个模块），抽成一个命名的 subflow 单独记录，flow 里引用它，不要每条都复制一遍。Subflow 值得抽的条件是两步及以上。
- **控件按可见文本引用** — 步骤里标识一个控件时，用用户看到的文本，必要时加位置来消歧（"Submit (personal-info section)"、"Edit (row 2)"）；不要写 css/xpath——UI 一变全崩，人也对不上。
- **Data conventions 写成条件规则** — "in <which scenario> → <which rule> → because <why>"。带上 why，读的人才能推广到你没写到的相邻情况。
- **坑就地留痕** — 探索过程中受的伤（一个同名控件需要更精确的定位、一个接口响应少了字段）就写在对应 entry 下面。这是文档最值钱的部分。
- **不要带时间敏感的措辞** — "currently"、"before launch" 这类词会悄无声息地过期；把过期内容移到文档末尾的 "Deprecated" section，正文只保留关于当下的内容。

## Maintenance rules

- **First time**：文档不存在时，plan 之前先完整走一遍 Step 0–5。
- **Incremental**：之后的 task 只补 gap——当这个 task 涉及的页面/接口/数据在文档里找不到时，只针对那一部分走 Step 0–5（frontier 里只放跟 gap 相关的种子）。不要每个 task 都全部重探一遍。
- **Whole-section regeneration**：发现某个 section（尤其是 page map）跟当前状态对不上了，重新探索该 section 并整段重写；不要逐行 patch——patch 会让新旧版本自相矛盾。
- **只收稳定事实**：跨 task 能复用的东西进文档；只跟当前 task 相关的（特意造的数据、临时 toggle）写进那个 task 的 execution manual，不要放这里。
- **能删就删** — 逐行检验一个问题："如果我删掉它，后面的 planning 或 testing 会不会因此犯错？" 如果不会，就删。一份臃肿的 context 文档会被整份无视。
