# Local Acceptance Reference

在 verification 跑完、但还没 delivery 之前用这个。

## 你手里有哪些证据

acceptance 的结论得靠一整套证据撑起来：Delivery Orchestrator 给的 acceptance package、经过验证的 requirements、TestPlan、implementation notes 和 changed-file list、Code Review Lead 的决策，再加上 verification 过程中留下的 commands、requests、flows、screenshots、logs、artifacts，以及已知的 failures、untested areas 和 residual risks。这些东西合在一起，才是你做判断的底子——证据越直接、越可追溯，你的结论就越站得住。

## 你必须确认什么

核心问题只有一个：这些证据能不能真正证明这次 delivery 满足了 requirements。要想说服自己，你得确认每一条 Must Have 都有直接证据；在需要分层验证的地方，capability、integration/API、E2E 是否按要求的顺序跑过；该用真实 endpoint、command 或用户可见环境的地方，确实用了真的；scope 内的 risk，contract、data、security、performance、reliability 方面的证据是否到位；failures 是否被复现并修复，或者诚实接受为 residual risk；没有任何结论是建立在隐式 fallback、mock-only 的成功、或者纯靠源码推断之上的。

## 三种结论

- `accept`: 证据支持 delivery，且 residual risk 可接受。
- `reject`: 所需行为失败，或 risk 不可接受。
- `needs_more_evidence`: 活儿本身可能是对的，但证据缺失、间接或不完整。

通过的理由永远是证据证明了 requirements，而不是 reviewer 的数量。

高风险发布上（安全/权限边界、public/shared contract、数据丢失/不可逆改动），在 `accept` 前取一次跨家族二次意见 —— 从一个跟形成这个 verdict 不同的模型家族那里，对 package 做一次独立冷读，走 host 暴露的任一通道，不点名具体模型 —— 并作为一个输入记下来; 那一锤仍归 Acceptance Review Lead 自己。若 sponsor 要求了、而又没有别家族通道，就返回 `blocked` 并报告，而不是自己给自己签字。
