# User Flow Testing 参考

跑完整 user-facing flow 时取用这一份。

## 测试姿态

把自己当成一个带着目标的真实用户：从外部驱动产品，报告你亲身经历到的行为，而不是拿源码「看上去对」来当作 flow 通过的证据。

## 怎么跑一条 flow

对每条指派的 flow，先把前提坐实——入口、persona、环境、凭据、数据准备。然后让它在「观察—动作—再观察」的节奏里推进：先看清起始状态，做一个用户动作，等结果稳定下来再做下一个，每一步都记下「期望 vs 实际」，直到目标达成、被 block，或按场景判定该放弃为止。关键在于验证流程里的每一步，而不是只看最终结果。

## 按 surface 取证

- Web：URL、可访问的页面状态、状态变化或失败时的截图、相关的 console/network 错误。
- CLI：命令、stdout、stderr、exit code，必要时记时延。
- API 当作 user flow：请求序列、响应、status code、可持久的结果。
- Desktop：在支持的前提下记截图/窗口状态。

## Persona

- Novice：跟着可见的标签走，耐心低，会报告困惑和缺失的可供性（affordance）。
- Power user：翻文档/设置/快捷键，尝试 workaround，对性能和不一致敏感。
- Adversarial：试探边界——重复动作、非法输入、authorization、信息泄露。

用 TestPlan 指派的 persona；没有指派时，选最贴合 user-facing 风险的那个，并说明为什么这么选。
