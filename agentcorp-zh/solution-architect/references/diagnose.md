---
id: diagnose
name: Bug Diagnosis
inputs: [validated requirements (bug report), reproduction steps if available]
outputs: [diagnosis design artifact]
optional: false
---

# Bug 诊断

在动手设计 fix 之前，先用证据把 defect 的 root cause 钉死。核心纪律是：每一步调查都必须从一个清晰、可验证的 hypothesis 出发，并以能证实或推翻它的 evidence 收尾。一旦发现自己没 hypothesis 就在乱试，立刻停下，先立一个。

## 你要做什么

把 hypothesis 磨到"具体到可以被证伪"的程度——比如"密码修改后 session token 没有刷新，导致旧 token 仍然有效"，而不是"auth 哪里有点问题"。拿真实代码和真实行为去 validate。如果成立，你就找到了 root cause；如果不成立，这个结果本身就是 evidence——继续搜集线索（线索断了就给代码加 instrumentation），然后立下一个 hypothesis。

Validation 要便宜且真实：用能真正 confirm 或 refute 的最小手段，绝不要用 fake return value 或 mock 去替代你试图解释的真实行为。区分 proximate cause（这行代码写错了）和 root cause（数据模型根本没考虑这种场景）——fix 要打在 root cause 上。

## 这份 artifact 必须达到什么效果

读完后，读者应该相信你找到了真正的 root cause，而且 fix 是针对它的最小改动。它必须说清楚：

- defect 是什么；
- 你 validate 了哪些 hypothesis，各自的 evidence 和结论是什么；
- root cause 是什么——要和 surface symptom 区分开，并有 evidence 支撑；
- 修复它的最小改动是什么，涉及哪些文件；
- regression risk——这个 fix 可能波及到什么。

只在必要时画 diagram：当一张图让人理解"faulty path vs. corrected path"比纯文字更轻松时才画。

如果 fix 最终涉及多个 module、改变了现有行为、或者修改了 interface，别让 diagnosis 去扛整个设计：把 root cause 和 regression criteria 留在 diagnosis 里，然后另附 `impact-analysis.md` 说明影响范围和哪些行为要保持；如果涉及 public/shared 或跨 module 边界，还要再附一份 `interface-contract.md`。

## 输出

把 artifact 写到 assignment 的 `output_path`（通常是 `design/diagnosis.md`），并遵循 `design-artifact` demo template 的格式。
