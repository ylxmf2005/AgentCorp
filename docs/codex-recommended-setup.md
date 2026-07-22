# Codex 推荐配置

本文记录一套可选的 Codex 本地工程配置，用于减少无效检索、控制工具输出，并让大型代码库的结构探索更直接。它不是 Longrein 的运行前提，也不应覆盖用户已有的模型供应商、认证、插件、项目授权和个性化设置。

Longrein 自身的安装、Skills 与 Task MCP 接入见 [安装与首次使用](getting-started.md) 和 [MCP](mcp.md)。本文只讨论可选的 Codex 本地效率配置。

本文组合三类能力：

| 层次 | 推荐配置 | 作用 |
| --- | --- | --- |
| Agent 编排 | `config.toml` 与只读 `explorer` | 限制并发和递归派生，把大规模检索隔离到低成本子代理 |
| 文件与终端 | FastCtx | 提供结构化读写、搜索、Bash 和增量后台任务，限制单次输出 |
| 代码结构 | CodeGraph | 为已选择的仓库建立本地符号图，查询源码、调用链和影响面 |

验证环境：Codex CLI `0.144.3`、FastCtx `0.1.1`、CodeGraph `1.5.0`，验证日期为 2026-07-22。版本变化后应先检查命令帮助和 `codex doctor`，不要把本文中的版本敏感字段视为永久契约。

## 安装原则

- 修改前备份 `~/.codex/config.toml`、`~/.codex/AGENTS.md` 和 `~/.codex/agents/`。
- 保留已有的模型供应商、认证、插件、项目授权、通知和桌面设置，只增改本文明确列出的配置。
- CodeGraph 只为用户明确选择的仓库建立索引，不自动索引主目录、下载目录或所有 Git 仓库。
- FastCtx 管理自己的 MCP 配置和 `AGENTS.md` 标记块；CodeGraph 安装器管理自己的 MCP 配置和标记块。不要复制出第二份长期规则。
- 第三方项目公布的 Token 节省比例只代表其测试样本，实际收益需要通过本机任务对照验证。

## 推荐执行顺序

顺序有实际意义：先完成通用配置和 CodeGraph，最后执行 FastCtx `apply`。部分 Codex 配置命令会重新序列化整个 TOML；如果它们在 FastCtx 之后运行，可能把 FastCtx 管理的整数写成浮点形式，导致 `fastctx status` 报配置漂移。

### 1. 备份现有配置

使用带时间戳的独立目录保存备份，不覆盖旧备份：

```bash
backup_dir="$HOME/.codex/backups/recommended-setup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
cp "$HOME/.codex/config.toml" "$backup_dir/config.toml"
cp "$HOME/.codex/AGENTS.md" "$backup_dir/AGENTS.md"
if [ -d "$HOME/.codex/agents" ]; then
  cp -R "$HOME/.codex/agents" "$backup_dir/agents"
fi
```

### 2. 配置 Codex 并发与输出边界

在现有 `~/.codex/config.toml` 中合并以下配置，不重建整个文件：

```toml
tool_output_token_limit = 10000

[agents]
# 一个主线程加最多三个并行子线程。
max_threads = 4
# 只允许主线程派生直接子线程。
max_depth = 1
```

这些字段控制容量，不负责决定何时派发子代理。派发边界仍应由 `AGENTS.md` 或具体 Skill 定义：只有相互独立、并行确有收益的工作才派发，简单任务继续由主代理完成。

在 `~/.codex/agents/explorer.toml` 配置只读探索代理：

```toml
name = "explorer"
description = "只读探索代理：用于代码库定位、资料检索、日志与测试证据收集，并向主代理返回高密度事实报告。"
model = "gpt-5.6-terra"
model_reasoning_effort = "low"
sandbox_mode = "read-only"
developer_instructions = """
你是只读探索代理。围绕主代理给出的明确问题查清事实，并交付可直接用于决策的高密度证据报告。

- 不修改文件，不执行会改变仓库、配置、服务或外部系统状态的操作。
- 不替主代理决定方案，不把事实调查扩展成未授权的实现或重构建议。
- 不派生其他代理，不管理整体工作流。
- 优先使用最窄检索范围，记录关键文件、行号、命令结果或文档来源。
- 返回结论、证据、未知项和风险，省略无价值的原始输出与过程叙述。
"""
```

如果当前账户没有 `gpt-5.6-terra`，选择可用的快速、低成本模型，但保持 `read-only` 和低推理强度的职责边界。

### 3. 安装 CodeGraph

CodeGraph 是第三方本地代码图工具。安装脚本应先检查再执行；自动化环境建议固定已验证版本：

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh \
  | CODEGRAPH_VERSION=v1.5.0 sh
codegraph telemetry off
codegraph install --target=codex --location=global --yes
```

`codegraph install` 会完成两件事：

1. 在 `config.toml` 中注册 `codegraph serve --mcp`。
2. 在全局 `AGENTS.md` 中维护 `CODEGRAPH_START` 与 `CODEGRAPH_END` 之间的短说明。

主代理会同时收到 MCP `initialize` 提供的完整使用说明；`AGENTS.md` 中的短块主要让子代理和没有 MCP 初始化能力的宿主知道，在已索引仓库中应优先使用 CodeGraph。

安装 CodeGraph 不会索引任何仓库。用户选择仓库后，在其根目录执行一次：

```bash
cd /absolute/path/to/repository
codegraph init
codegraph status
```

索引保存在仓库的 `.codegraph/` 中。不要在 `$HOME`、文件系统根目录或范围不明的父目录运行 `codegraph init`。CodeGraph `1.5.0` 已默认在 `init` 时建立索引，旧文章中的 `codegraph init -i` 已废弃。

### 4. 安装 FastCtx

FastCtx 是第三方 MCP，提供 `read`、`grep`、`glob`、`replace`、前后台 Bash 和持久任务输出。标准档位让 Codex 保留 10k 工具输出上限，同时把 FastCtx 单次预算控制在 8.5k 左右。

```bash
npm install --global fastctx --registry=https://registry.npmjs.org/
fastctx apply --tier standard --yes
fastctx status
```

`fastctx apply` 应放在其他 `config.toml` 写入动作之后。它会维护 FastCtx 自己的 MCP 表、输出预算和 `AGENTS.md` 中 `fastctx:begin` 与 `fastctx:end` 之间的说明。以后如果其他配置工具重写了 TOML，重新运行以下命令修复 FastCtx 管理项：

```bash
fastctx apply --tier standard --yes
fastctx status
```

FastCtx 与 CodeGraph 的职责不同：CodeGraph 先回答符号、调用链和影响面；FastCtx 负责配置、文档、日志、未索引内容、精确文件操作和测试命令。CodeGraph 不可用或仓库未索引时，继续使用 FastCtx。

## 验证

配置完成后完全退出并重新打开 Codex，再执行：

```bash
codex mcp list
codex doctor
fastctx status
codegraph --version
```

预期结果：

- `config.toml` 能正常解析。
- `fastctx` 和 `codegraph` 均为 enabled。
- FastCtx MCP 握手成功，工具契约检查通过，`AGENTS.md` 标记块无漂移。
- CodeGraph MCP 暴露 `codegraph_explore`。
- 已执行 `codegraph init` 的仓库中，`codegraph status` 显示有效索引；未初始化仓库保持未索引状态。

验证实际收益时，使用同一仓库的同类任务比较工具调用次数、输入 Token、完成时间和结论完整性。不要只根据工具自己的 benchmark 判断是否保留。

## 回滚

FastCtx 通过自己的管理命令撤销配置：

```bash
fastctx unapply --yes
npm uninstall --global fastctx
```

CodeGraph 项目索引按仓库删除，随后再移除代理配置与 CLI：

```bash
cd /absolute/path/to/repository
codegraph uninit

codegraph uninstall --target=codex --location=global --yes
```

需要恢复安装前的完整 Codex 配置时，从对应时间戳备份中逐项恢复。不要用一个旧 `config.toml` 直接覆盖后来新增的认证、插件、项目授权或其他有效配置。

## 暂不纳入

- Headroom 的代理、共享记忆和自动学习影响面较宽，与 FastCtx 输出控制存在重叠，只有真实长日志或大 JSON 仍持续污染上下文时再隔离试验。
- RTK 主要压缩 Codex Bash Hook 路径，而 FastCtx 通过 MCP 执行 Bash，默认链路不能稳定覆盖，暂不增加第二套 Shell 代理。
- Caveman 主要压缩模型回复，并会增加常驻提示成本；需要短回复时使用任务级长度要求，不改变全局沟通质量。
