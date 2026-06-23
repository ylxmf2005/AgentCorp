# pipeline: 将变更 walk 进本地 forge PR

依赖: `python3` (标准库), `git`。所有脚本都在 `scripts/` 目录下，仅使用标准库。Forge 凭据由 `setup_forge.py` 写入 `~/walker-forgejo/walker.env`，脚本会自动读取。

## Comment JSON 契约 (由 walker 产出, post_review 消费)

```json
{
  \"body\": \"可选的总体评论 (一句话概括这个变更)\",
  \"comments\": [
    {\"path\": \"<repo-relative path>\", \"body\": \"<why, zh-CN markdown>\", \"new_position\": <new-file line number>},
    {\"path\": \"<...>\",                \"body\": \"<...>\",                 \"old_position\": <old-file line number>}
  ]
}
```

- 一条 comment 锚定一行: 新增/上下文行用 `new_position` (新文件行号), 纯删除行用 `old_position` (旧文件行号)。二选一。
- 行号必须来自 `diff_outline.py` 中的真实值; 不要手数。
- 粒度: 每个函数 / 每个分支 / 每个有意义的常量组 一条 comment; 大块代码必须拆分 (见 coverage gate)。

## Steps

```bash
S=<skill>/scripts        # 本 skill 的 scripts 目录
REPO=/path/to/target     # 目标 repo (只读)
BASE=origin/main         # base ref
HEAD=<sha or ref>        # head

# 1. 确保本地 forge 已启动 (幂等; 如果已经在跑就直接复用)
python3 $S/setup_forge.py

# 2. Mirror 成本地 PR (base branch = merge-base, head branch = head, PR diff == git diff BASE..HEAD three-dot)
python3 $S/mirror_pr.py --repo $REPO --base $BASE --head $HEAD --name <forge-repo-name>
#   → JSON: {owner, repo, index, merge_base, head_sha, files_url}

# 3. 获取带行号的 diff outline
python3 $S/diff_outline.py --repo $REPO --merge-base <merge_base> --head <head_sha> > /tmp/outline.json
```

**写 comment 前先核对范围**: `diff_outline.py` 列出的每个文件、每个 hunk 都必须进入你的 comment 集合。只 review 一个文件、或者跳过一整个新文件 / SQL migration，默认算漏了，不算有意缩小范围 —— 除非 assignment 限定了范围，并且你在 receipt 里声明 \"这次只 walk 了 X，其余没覆盖\"。SQL migration、handler、schema 这类东西往往是风险密度最高的地方，最不该被漏掉。

Step 4 是你的工作 (walker 的): 读取 `/tmp/outline.json`，逐文件、逐函数写 comment。每个 `files[].hunks[]` 给出 `changed` (变更行数) 以及每行变更的 `new`/`old` 行号。按 `references/hunk-comment.md` 里的规范写 `body`，在函数内选一个变更行的 `new` (或删除段的 `old`) 作为 anchor，组装成上面的 comment JSON 写入 `/tmp/comments.json`。

```bash
# 5. 把所有 comment 发到 PR 里 (一个 POST 创建一个 review)
python3 $S/post_review.py --repo <forge-repo-name> --index <index> --comments /tmp/comments.json

# 6. Coverage gate: 读回来并对账
python3 $S/coverage_gate.py --repo $REPO --merge-base <merge_base> --head <head_sha> \
        --forge-repo <forge-repo-name> --index <index>
#   exit 0 = pass; 非零 = 列出 GAP (哪个 hunk、多少变更行、多少 comment、需要多少)
```

## Coverage and density

Gate 的规则 (默认): 每个 hunk 至少在其行范围内锚定 1 条 comment; **大 hunk (变更行数 > 20) 需要 ≥ ceil(变更行数 / 40) 条 comment** —— 这迫使大块代码按函数拆分，而不是用一条 comment 一笔带过。

补 gap 循环: gate 报 GAP → 给这些 hunk 补充函数级 comment → 再跑 `post_review.py` (它会创建一个新的 review; gate 会跨所有 review 读回 comment 并累计对账) → 再跑 `coverage_gate.py`，直到 exit 0。不要为了过 gate 塞空填充 —— 每条 comment 仍然要解释清楚真实的 \"why\"; 实在解释不了的，标为 `untraceable` 并列出你查过的证据。Gate 只 enforce 密度; 质量由 writing discipline 和 review 兜底。

## Wrap-up

把 `files_url` 交给 requester，对方登录本地 forge 后在原生 PR UI 里 review。sandbox repo 堆积时，按需删除: `DELETE /api/v1/repos/{owner}/{repo}`。

## Boundaries

目标 repo 是只读的 (仅 rev-parse / merge-base / push existing commits)。只在**本地** forge 上操作，永远不要往真实 remote push 或发 comment。不要把凭据写入任何会被 commit 的文件。
