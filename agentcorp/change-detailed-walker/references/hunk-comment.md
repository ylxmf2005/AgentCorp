# Comment writing rules

This document defines how to write each comment posted into the forge PR. Writing quality and traceability are governed here; how comments are posted, how lines are anchored, and how coverage is enforced are in `references/pipeline.md`.

You write from a **god's-eye view**: you have already read the diff and the surrounding code, and whatever needed checking, you already checked. A comment is a **conclusion you hand a colleague** — not your investigation process, and not a to-do list for them. The change is already delivered; your job is to explain, clearly and conclusively, **what it is** and **why it's done this way**, the way a senior colleague who has read everything would just tell you. It is **not** a risk audit.

## Fields of one comment

Each comment passed to `post_review.py` is `{path, body, new_position or old_position}`:

- `path`: repo-relative path (new path for additions/modifications, old path for pure deletions).
- `body`: zh-CN markdown — the conclusion.
- `new_position` / `old_position`: the anchor line number from the real values in `diff_outline.py`. Anchor added/context lines on `new`, pure deletions on `old`. Pick one.

## What every comment says

Two things, always, stated as conclusions (not as questions or things to verify):

1. **What it is / what it does** — in plain words: which function or logic was added/changed, what it's responsible for, roughly how it flows. Even if a code comment already says so, restate it more plainly. Without this layer the comment fails.
2. **Why it's done this way** — the intent: what this change or refactor is trying to achieve. If it's part of a pattern, say so ("same 'push the logic down into the service' refactor as the two endpoints above").

Then, **only if there is a genuine, real problem**, add **one conclusive sentence** about it — a true bug, leftover residue, a drive-by refactor, an out-of-scope change. State it as a fact you found, not as something to investigate. No real problem → write no risk text at all.

That's the whole comment. Two layers plus, when warranted, one conclusion. Keep it tight.

## Write conclusions — not your process, and don't hand work to the reader

This is the most important rule, and the one most easily broken.

- **State the conclusion, not your investigation.** ✗ "我已对照 remix_service.py:592-617，四项都搬过去了" — that's you showing your work. ✓ "四项逻辑在 service 里完整保留，行为等价。" The reader doesn't want to watch you verify; they want the verdict.
- **Don't defer to the reader.** ✗ "（必看）", "逐项核对 service 是否完整复刻了旧逻辑，否则静默丢功能", "维护者要确认 X". You have the god's-eye view — *you* do the confirming and write the result. If something genuinely wasn't carried over, state it as a fact: "X 没搬过去，这里会丢 Y 功能。"
- **Don't pile up risks or hedge.** A delivered change does not need a risk checklist. If there is one real issue, name it in one conclusive line — no "可能", no "否则", no "要注意". If there isn't, say nothing about risk; don't write "此处无新增风险".
- **No meta.** Don't reference earlier versions, your own iteration, or the review process. The comment stands alone.

A cross-file fact is fine and useful — but state it as the **conclusion of a check you already did** ("四项已在 service 完整复刻，行为等价"), never as a contract for the reader to go verify or a hedge ("若 X 改成抛错则全失效").

## Granularity: anchor on semantic units, don't lay out by line

- One comment per function / per branch / per meaningful group of constants; when logic is dense, as fine as a single line.
- **Big blocks must be split**: a hunk over ~20 changed lines splits by function into multiple comments, each anchored to a real changed line in that function.
- **Don't carve into even line-range blocks just to hit density.** The gate enforces a density floor, not "slice the file into contiguous ranges, one comment per block." If your comment ranges, sorted, tile the whole file with zero gaps, that's laid-out blocks — re-anchor to real semantic units. Better several complementary comments on one function than one comment over an unrelated range.
- Pure mechanical churn (formatting, import reordering, bulk rename): one brief comment stating which kind of mechanical change it is. If it's itself a big block, still anchor at sufficient density.

## Classification (decides how you write; not a label pasted into the body)

Have a classification in mind for each change. **Don't prefix the body with "normal" labels** (`core`/`supporting`/`mechanical`) — readers want the explanation, not a tag. Only the three "needs caution" classes get a conspicuous marker at the start of the body, as a one-line conclusion:

| Classification | How to decide | Body marker |
| --- | --- | --- |
| `core` | Directly carries the main capability or fix | none |
| `supporting` | Necessary support (call-site pass-through, helper query, fixture) | none |
| `mechanical` | Mechanical churn, weak or no behavioral intent | none |
| `suspect-refactor` | Looks like a drive-by refactor, authorization unclear | `【可疑·顺手重构】` |
| `suspect-residue` | Suspected leftover from an earlier approach, or out-of-scope semantics | `【可疑·残留】` |
| `untraceable` | No credible authorization/intent evidence | `【追溯不到】` |

- A `suspect-*` marker is a conclusion: state the suspicious fact in one line ("这是顺手重构，和本次需求无关"), don't open a risk discussion.
- `untraceable`: don't fabricate a source; say which evidence you checked (requirements, design, commits, neighboring code) and couldn't trace it.
- Catching residue and out-of-scope changes is a core purpose of this tool — but it's a verdict, not a hedge. **Zero suspects across a dozens-of-files change usually means you didn't look hard**, not that it's clean.

## Traceability

Light touch: when it clarifies why a spot exists, point to the authorization (a requirements/design item, or a commit). For a branch with no design doc, use `<repo alias> <short sha> <subject keywords>`. When one large commit covers many spots, don't repeat the same branch label everywhere — either name the sub-intent for this spot, or chain causality with "配合 `<file>:<symbol>`". Don't turn trace into clutter.

## Counterexamples

### Counterexample 1 (most common): investigation process + risk audit + deferring to the reader

> 核心：update_remix_cache 是改动最大的一处。原 handler 里塞了管理员校验、按 compilation_content_id/file_id 分流、文件存在性校验、asyncio.create_task 起异步日志，现在全删掉压成一次 await remix_service.update_cache_for_user(...)。
> 风险 / 行为等价性（必看）：这次搬迁要逐项核对 service 侧是否完整复刻了旧逻辑，否则就是静默丢功能：①②③④……我已对照 remix_service.py:592-617，四项都搬过去了。但有个隐患……维护者要知道这条日志旁路不可靠……

What's wrong: "（必看）/逐项核对/否则静默丢功能/维护者要知道" hands the verification to the reader; "我已对照……四项都搬过去了" is the walker showing its work; the whole thing is a hedged risk audit for an already-delivered change.

On target (god's-eye conclusion):

> `update_remix_cache`：原来在 handler 里直接做的四件事——管理员鉴权、按 compilation_content_id / file_id 分流、文件存在性校验、异步操作日志——整体下沉进 `remix_service.update_cache_for_user`，handler 只剩一行转发。和上面两个删除接口是同一套「逻辑收进 service」重构，四项在 service 里完整保留、行为等价；那几行 `logger.info` 只是单行字符串拆成多行拼接，无行为变化。一处遗留：异步日志仍是裸 `asyncio.create_task`，出错会被静默吞、请求结束可能被取消——旧代码就这样，本次没动。

Why it lands: what + why as conclusions; "行为等价" is a verdict you reached (you don't show the checking); the one real leftover is a single factual line, not a "must-check" audit.

### Counterexample 2: play-by-play (reciting code in order)

> 先校验源归档就绪，再生成不冲突 id（最多重试 5 次），再复制归档（失败先删目标再抛），然后在 try 块里创建任务、创建记录、写引用、创建提交、初始化对象，任一步异常走整组回收并 raise……

What's wrong: recited the code in order; the reader still doesn't know **why** retry 5 times or **why** delete-then-raise.

On target:

> 复制失败后先删目标对象再抛，是为了不让半拷贝留下的孤儿对象在下次重试里被当成已就绪。

### Counterexample 3: only praising, or over-hedged risk

> （只夸）补偿写在 clone 旁边，登记失败就回收私有副本避免孤儿，和 task_file 分支对称，设计很好。
> （过度对冲）……接手前要确认它幂等、失败可吞；若 create_asset 改成撞键抛错，这里的回收逻辑全失效……

On target (one conclusion on the one real issue):

> 补偿紧贴 clone：登记失败时回收本次铸的私有副本——只有这层握着 `clone_result`，外层不知道铸了什么。一个真问题：`cleanup_cloned_forge_project` 失败时会用清理异常盖掉原始的 create 异常，上层看到的是「清理失败」而非真正的登记失败。

Final self-check, runs through the whole document: would I say this, in these words, to a colleague taking over the code? If it reads like my notes-to-self, a risk checklist, or homework for them — rewrite it into a plain conclusion.
