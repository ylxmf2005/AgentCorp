# Routing probes — realistic phrasings vs the router table

Rerun after any router-row or description change: give an agent `hooks/agentcorp-router.md` plus these messages, ask which row fires first under a plain reading and whether that serves the user. `expected` below is the post-fix expectation (2026-07-09 audit baseline); `watch` names the confusion neighbor that must not lose or steal the message.

| # | Message | Expected route | Watch |
| --- | --- | --- | --- |
| 1 | 帮我修个 bug:导出 CSV 的时候中文列名乱码 | delivery-orchestrator (defect intake) | review-fixer must NOT fire on bare "fix/修" |
| 2 | 帮我看懂这个分支 | walkthrough | explain (near-identical zh triggers) |
| 3 | 这个 PR 改了什么? | explain | walkthrough |
| 4 | 把这次改动讲给我听,顺便考考我 | walkthrough | — |
| 5 | 拷问一下我的方案,看看它扛不扛得住 | grill | adversarial-reviewer (written-artifact lane) |
| 6 | 挑战一下这个设计,有没有想当然的地方 | adversarial-reviewer | grill |
| 7 | 让 config 这个模块更好维护一点 | delivery-orchestrator (improvement intake) | simplicity/taste rows are review lanes, not entrances |
| 8 | 我不知道从哪开始 | probe | brainstorm |
| 9 | 开工前先探探这个代码库,我怕有坑 | probe | — |
| 10 | 帮我把需求理清楚,现在还很模糊 | brainstorm | — |
| 11 | 帮我查一下我们仓库里限流机制是怎么实现的,好像跨了好几个模块 | parallel-researcher (in-repo lane) | probe |
| 12 | 业界现在做限流一般用什么方案,帮我调研一下 | parallel-researcher | — |
| 13 | 代码里注释太啰嗦了,清理一下 | comment-optimizer | — |
| 14 | 这段代码写得优不优雅,帮我看看 | taste-reviewer | simplicity-reviewer |
| 15 | review 一下我刚写的代码 | code-review-lead | specialist lanes |
| 16 | 上线前帮我做个验收 | delivery-orchestrator (verify → acceptance chain) | acceptance-review-lead alone (judges, produces no evidence) |
| 17 | 为啥这个测试老是时红时绿 | solution-architect (diagnosis) | — |
| 18 | 前端页面暗色模式下看不清,修一下 | explicit out-of-scope reply (no frontend owner) | any silent generic attempt |
| 19 | 把这个改动合到 main 并推上去 | explicit boundary reply (merge/push stays with sponsor) | bare git improvisation |
| 20 | 总结一下这次任务学到了什么,下次别再踩同样的坑 | delivery-orchestrator (compound) | — |
| 21 | 帮我优化一下这个 skill | skill-evolution | external skill-creator plugin (environment-level overlap) |
| 22 | 登录态下帮我调一下这个内部接口试试 | authenticated-browser-session | — |
| 23 | 需求是实时导出 300 万行 CSV,200ms 内返回,不许分页 | delivery-orchestrator (requirement intake → validate-requirements) | building the impossible spec directly |
| 24 | 刚才那个修复把审计日志也降级了,快修一下 | delivery-orchestrator (regression/fix-loop intake) | review-fixer on bare "fix" |
