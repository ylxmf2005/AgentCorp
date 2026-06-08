# 本地验收参考（Local Acceptance Reference）

在验证（verification）跑完之后、交付（delivery）之前用这一份。

## 你手上的证据

验收的判断建立在一整套证据之上：来自 Delivery Orchestrator 的验收包（acceptance package）、已验证需求、TestPlan、实现说明与改动文件清单、Code Review Lead 的决定，以及验证过程留下的命令、请求、流程、截图、日志与产物，外加已知的失败、未测区域和残余风险。这些共同构成你下判断的依据——证据越是直接、可追溯，结论才越站得住。

## 你要确认什么

核心只有一个问题：证据是否真的证明了这次交付满足需求。要让自己信服，就得确认每一条 Must Have 都有直接证据；在该分层的地方，capability、integration/API、E2E 各级是否按要求的顺序跑过；该用真实端点、命令或面向用户的环境的地方是否确实用了；针对落在范围内的风险，契约、数据、security、performance 或 reliability 的证据是否到位；失败是被复现并修掉了、还是被如实接受为残余风险；以及——没有任何结论是靠隐式 fallback、仅 mock 的成功、或单纯从源码推断撑起来的。

## 三种结论

- `accept`：证据支撑交付，且残余风险可接受。
- `reject`：必需行为失败，或风险不可接受。
- `needs_more_evidence`：工作本身可能是对的，但证据缺失、间接或不完整。

放行的理由永远是证据证明了需求，而不是评审人数量多。
