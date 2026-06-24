---
name: precommit-setup
description: "当 AgentCorp 需要为仓库配置或改进 pre-commit 检查、commit-time 约束、Git hook 工作流、staged-file 质量检查，或把 Codex/Claude 的慢速 AI commit review 作为可选 pre-commit 环节时使用。用户要求 setup precommit、增加 commit 约束、配置本地提交前检查或把 AI review 接入提交流程时使用。"
---

# Precommit Setup

这是 AgentCorp 的通用支撑能力，不是交付 phase，也不是带独立 gate 的角色。用于给目标仓库添加实用的提交前约束，同时避免把每次 commit 都变成一条很慢的交付流水线。

目标是“默认快、按需深”：普通 commit 跑快速、确定性的本地检查；Codex/Claude commit review 这种慢检查必须显式开启或按条件触发。

## 工作流

1. 先检查目标仓库，再选工具：
   - 现有 hook 系统：`.pre-commit-config.yaml`、`lefthook.yml`、`.husky/`、`.git/hooks/`、`package.json` hook scripts。
   - 现有质量命令：`Makefile`、`justfile`、`package.json`、`pyproject.toml`、`tox.ini`、`go.mod`、`Cargo.toml`、CI 配置。
   - 现有提交规则：`AGENTS.md`、`CLAUDE.md`、`CONTRIBUTING.md` 或 docs。
2. 仓库已经有 hook 工具时，优先沿用。
3. 没有 hook 工具时，优先选择语言无关的 `pre-commit` framework。Husky 只用于 Node-first 仓库或已有 Husky 的仓库。Lefthook 适合已有配置或多语言 monorepo。
4. 先配置快速检查，让默认 commit 延迟保持低。
5. 把 commit 约束写成明确、可读的检查。
6. AI commit review 只作为慢速可选路径接入。
7. 本地实际运行 hook，并记录完整安装/验证命令。

## 默认快速检查

默认 pre-commit 检查应当确定、本地、快速。工具支持时优先检查 staged files。

合适的默认项：

- 空白、文件末尾、merge conflict markers、大文件检查。
- 仓库已经使用的 formatter 或 format check。
- 仓库已经使用的 linter。
- 只有在已有命令足够快时才默认跑 type check。
- 只有足够便宜且本地稳定的测试才默认跑。
- 已有或容易接入的 secret scanning。

不要把完整测试套件、浏览器测试、依赖安装、网络请求或 AI review 设成每次 commit 必跑。

## Commit 约束

commit 约束要做成本地 guardrail，能看懂，也能在必要时有意识地绕过。

常见约束：

- 阻止 unresolved merge conflict markers。
- 阻止明显 secret 或本地 credential 文件。
- 仓库有约定时，阻止只提交生成产物而没有 source 变化。
- 阻止提交 AgentCorp runtime artifacts，例如 `teamspace/`，除非用户明确要提交。
- 仓库能可靠检测时，阻止和当前任务无关的大面积格式化/噪音改动。
- 只有仓库已有 commit message 规范或用户要求时，才在 `commit-msg` enforce message style。

失败信息要说清失败项、为什么重要，以及如何重跑。

## 可选 AI Commit Review

Codex/Claude commit review 有价值，但慢。不要把它接成无条件 pre-commit。

使用下面任一触发模型：

- **手动命令**：例如 `make ai-commit-review` 或 `npm run ai:commit-review`。
- **环境变量 opt-in**：只有设置 `AI_COMMIT_REVIEW=1` 时运行。
- **路径/风险触发**：只有 staged files 触及 auth、支付、migration、public API、安全策略等敏感区域时运行。
- **pre-push 而不是 pre-commit**：团队想做深检查但不想阻塞每个本地保存点时，放到 push 前。

AI review 默认检查 staged diff，不检查整个 working tree。详细记录写到本地忽略目录，例如 `.agentcorp/commit-review/`；终端只输出简短 pass/fail 摘要。

添加 AI review hook 时，必须明确失败行为：

- 默认建议：warn but do not block，除非用户要求阻塞。
- 保护级或高风险仓库可以开启 blocking mode，但必须 opt-in。
- 一定要提供 bypass 路径，例如 `SKIP=ai-commit-review git commit ...` 或 hook 工具的标准 skip 机制。

## 配置模式

使用 `pre-commit` 时，优先从小型 `.pre-commit-config.yaml` 开始：先放通用检查，再按现有命令增加 repo-local hooks。

repo-local 命令示例：

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-merge-conflict
      - id: check-added-large-files
  - repo: local
    hooks:
      - id: unit-check
        name: unit check
        entry: make test
        language: system
        pass_filenames: false
```

可选 AI review 要显式 guard：

```sh
if [ "${AI_COMMIT_REVIEW:-0}" != "1" ]; then
  echo "AI commit review skipped; set AI_COMMIT_REVIEW=1 to run it."
  exit 0
fi
```

使用用户本机已有的 CLI。不要编造不存在的参数；先查 `codex --help`、`claude --help` 或仓库已有脚本。

## 验证

配置完成后运行：

1. hook 安装命令，例如 `pre-commit install` 或仓库等价命令。
2. 完整 hook，例如 `pre-commit run --all-files`，除非它已知过慢。过慢时，跑 targeted staged-file check 并说明原因。
3. 如果本机有对应 CLI，分别验证 AI review 的跳过路径和 opt-in 路径。
4. `git status --short`，确认只改了预期 setup 文件。

汇报时说明：安装的工具、增改文件、执行命令、结果、剩余慢检查，以及如何跳过或开启 AI review。
