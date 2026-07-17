# Longrein

**长缰（long-reining）：驯导者不再骑在马背上，而是站在地面，用一副长缰让马自己完成动作。**

强模型已经不需要被教怎么做事。Longrein 关心的是另一件事：模型放开跑的时候，缰绳仍然在人手里——盲区被主动暴露，方案供人反应，结论带着可检查的证据交回，方向、价值和后果始终由人承担。协作的产出不只是代码和文档，还有一个判断力比开始时更强的人。

为此它同时约束循环的两侧：模型先接触真实情况再下结论，实现追到根因，完成声明必须经得起独立评审、真实测试和证据检查；人则始终被带回能够观察、质疑和作出下一次判断的位置。

## 组成

**常驻注入（`global/`）**——随每次会话生效的底层态度，由 CLI 作为托管块写入 `~/.claude/CLAUDE.md` 与 `~/.codex/AGENTS.md`：

| 块 | 作用 |
|---|---|
| `soul` | 贯穿一切工作的工程态度：像明天还要为它值班的人。 |
| `context` | 让所有 Skill 共享同一份 Task Context、Git 基线与 Task Operating Envelope。 |

**按需 Skills（`skills/`）**——由模型根据任务触发，或用 `/name`（Claude Code）、`$name`（Codex）显式调用：

| Skill | 作用 |
|---|---|
| `shape` | 先让领地说话，再让方向取得承诺资格。 |
| `prompt` | 用户手动调用后，从真实任务中提炼简单、可复用的更好提示词。 |
| `rewind` | 当前时间线被错误前提污染时，保留可靠资产并回到可信位置。 |
| `design` | 查明故障根因，或形成可修订的架构、契约、影响分析和实现路线。 |
| `dev` | 实现功能、修复缺陷和落实已确认问题，交付最小诚实改动。 |
| `review` | 独立冷读需求、设计、代码和交付物，以因果证据确认问题。 |
| `test` | 制定 TestPlan、执行真实测试并交付可重放的 Test Report。 |
| `walkthrough` | 把人带回能够理解对象、检查证据并继续作出判断的位置。 |
| `evolution` | 让这轮代价进入正确作用域，并真正改变下一轮。 |

Skills 按任务自然组合，不为流程完整而全部触发：简单任务保持简单，只有真实风险、未知和证据要求才增加相应能力。

## 安装

```bash
npm install -g longrein
longrein install        # 交互选择；-y 全装
```

从源码：

```bash
git clone <repo> && cd longrein
npm install && npm link
longrein install
```

开发这套 Skills 本身时用链接模式，编辑即生效：

```bash
longrein install --link -y
```

链接模式下只有新增/删除 Skill 目录需要重跑一次；也可以配一个文件监听（macOS launchd / Linux systemd path unit），在 `skills/` 与 `global/` 变化时自动执行它。

## CLI

```text
longrein                    状态面板：每个 skill 在两端的安装状态 + 托管块状态
longrein install [skill…]   安装（默认 copy；--link 链接到当前 checkout；--force 接管同名目录）
longrein uninstall --all    移除全部 skill 与托管块（也可指定单个 skill）
longrein update             刷新过期副本、清理断链并重新同步托管块
longrein list               纯文本列出全部 skill（可脚本化）
longrein doctor [--fix]     体检：残留链接、过期副本、托管块漂移、标记损坏
```

所有命令支持 `--claude` / `--codex` 只作用于一端。CLI 只认自己创建的东西——指向本包的符号链接、带 `.longrein.json` 戳记的副本、`LONGREIN BLOCK` 标记内的内容；标记外的用户内容和其他来源的 skill 一律不碰。

用户可以自行维护 `~/.longrein/user-context.md`，记录稳定的语言、背景、理解方式和协作偏好。文件存在且非空时，CLI 会像常驻块一样注入 Claude Code 与 Codex，但只读取和同步，永不创建、覆盖或改写源文件。

## 仓库结构

```text
longrein/
├── skills/                 # 按需 Skills（每个含 SKILL.md，可带 references/scripts/assets）
├── global/                 # 常驻注入块（soul.md、context.md）
├── cli/                    # longrein CLI（Node + Ink + TypeScript）
├── references/             # 仓库级研究材料，不随 Skill 调用加载
└── studio/                 # 研究、探针与任务产物
```

新增 Skill 只需创建 `skills/<name>/SKILL.md`；新增常驻块只需创建 `global/<owner>.md`。

## 修改与验证

Skill 是跨用户、跨项目的长期能力。当前任务事实留在任务或项目中；用户个人偏好留在用户资料中；只有能够跨任务重放的行为问题才进入通用 Skill。

非平凡任务使用共享 Task Context：Shape 形成目标、scope 与完成边界；Project Context 提供项目现实和证据，Task Context 记录本轮承诺负责的 Task Operating Envelope；Design、Dev、Review 与 Test 消费同一份状态。简单任务可以只在对话中保持这份上下文，跨阶段、跨分支或需要持久交接时写入 `<task-workspace>/task.md`。

文字变化本身不等于能力改善。会改变触发、判断、动作、权限或产物语义的修改应使用相同任务做前后对照，并检查正确性、完整性、用户介入、意外动作、成本和长上下文副作用；断链、格式、历史状态与 UI 元数据使用相称的静态验证。流程见 `skills/evolution/`。

CLI 修改后运行：

```bash
npm run typecheck && npm run build && longrein doctor
```
