# Longrein

**长缰（long-reining）：驯导者不再骑在马背上，而是站在地面，用一副长缰让马自己完成动作。**

强模型已经不需要被教怎么做事。Longrein 关心的是另一件事：模型放开跑的时候，缰绳仍然在人手里——盲区被主动暴露，方案供人反应，结论带着可检查的证据交回，方向、价值和后果始终由人承担。协作的产出不只是代码和文档，还有一个判断力比开始时更强的人。

为此它同时约束循环的两侧：模型先接触真实情况再下结论，实现追到根因，完成声明必须经得起独立评审、真实测试和证据检查；人则始终被带回能够观察、质疑和作出下一次判断的位置。

## 组成

**常驻注入（`global/`）**——随每次会话生效的底层态度，由 CLI 作为托管块写入 `~/.claude/CLAUDE.md` 与 `~/.codex/AGENTS.md`：

| 块 | 作用 |
|---|---|
| `soul` | 贯穿一切工作的工程态度：像明天还要为它值班的人。 |
| `prompt-watch` | 常驻观察表达与上下文怎样影响结果，值得教学时引导到 `prompt`。 |

**按需 Skills（`skills/`）**——由模型根据任务触发，或用 `/name`（Claude Code）、`$name`（Codex）显式调用：

| Skill | 作用 |
|---|---|
| `shape` | 调查真实情况，挑战错误方向，形成值得承诺的目标与边界。 |
| `prompt` | 从实际协作偏差中帮助用户改进提示词，不在真空中润色。 |
| `rewind` | 当前时间线被错误前提污染时，保留可靠资产并回到可信位置。 |
| `design` | 形成可修订的架构、契约、影响分析和实现路线。 |
| `dev` | 实现功能、修复缺陷和落实已确认问题，交付最小诚实改动。 |
| `review` | 独立冷读需求、设计、代码和交付物，以因果证据确认问题。 |
| `test` | 制定 TestPlan、执行真实测试并交付可重放的 Test Report。 |
| `walkthrough` | 把人带回能够理解对象、检查证据并继续作出判断的位置。 |
| `evolution` | 从真实失败和摩擦中提炼经验，并在人工批准后改进长期能力。 |

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

## 仓库结构

```text
longrein/
├── skills/                 # 按需 Skills（每个含 SKILL.md，可带 references/scripts/assets）
├── global/                 # 常驻注入块（soul.md、prompt-watch.md）
├── cli/                    # longrein CLI（Node + Ink + TypeScript）
├── references/             # 仓库级研究材料，不随 Skill 调用加载
└── studio/                 # 研究、探针与任务产物
```

新增 Skill 只需创建 `skills/<name>/SKILL.md`；新增常驻块只需创建 `global/<owner>.md`。

## 修改与验证

Skill 是跨用户、跨项目的长期能力。当前任务事实留在任务或项目中；用户个人偏好留在用户资料中；只有能够跨任务重放的行为问题才进入通用 Skill。

文字变化本身不等于能力改善。重要修改应使用相同任务做前后对照，并检查正确性、完整性、用户介入、意外动作、成本和长上下文副作用；流程见 `skills/evolution/`。

CLI 修改后运行：

```bash
npm run typecheck && npm run build && longrein doctor
```
