# 会议记忆治理研究项目

本项目用于设计和推进一项 HCI 研究：考察在长期协作型 AI 助手中，将系统记忆做成“可查看、可编辑、可治理”的交互层，是否能够提升用户的纠错能力、控制感、校准后的信任，以及下游协作决策质量。

## 项目状态

- 创建时间：2026-04-21
- 当前阶段：`CSCW` 导向的研究 framing 重构 + 编码前设计冻结
- 主目标会议：`CSCW 2027`
- 次目标会议：`IUI 2027`
- 可选早期版本：`CUI`、`ICMI Demo/LBR`

## 原型运行模式

当前 Web 原型支持两种 responder：

- `deterministic`：本地规则 responder，适合开发和受控回放
- `OpenAI GPT-4.1`：通过官方 `OpenAI JS SDK + Responses API` 调用真实模型

默认建议使用：

- `MMG_RESPONDER_MODE=auto`
- `OPENAI_MODEL=gpt-4.1-2025-04-14`

这样在配置了 `OPENAI_API_KEY` 时会优先走真实模型；如果密钥缺失或服务暂时不可用，则自动回退到本地 deterministic responder。

### 后端环境变量

- `OPENAI_API_KEY`：OpenAI API key
- `OPENAI_MODEL`：默认 `gpt-4.1-2025-04-14`
- `MMG_RESPONDER_MODE`：`auto | deterministic | openai`
- `OPENAI_TIMEOUT_MS`：默认 `30000`
- `OPENAI_MAX_OUTPUT_TOKENS`：默认 `700`
- `OPENAI_TEMPERATURE`：默认 `0.2`
- `BASE_PATH`：线上部署时使用 `/meeting-memory-governance`
- `ACCESS_CODE`：页面访问验证码

### 本地启动

后端目录：

```bash
cd /root/workspace/research/meeting-memory-governance/prototype/backend
npm install
npm run start
```

如果要强制使用真实 `GPT-4.1`：

```bash
export OPENAI_API_KEY=...
export MMG_RESPONDER_MODE=openai
export OPENAI_MODEL=gpt-4.1-2025-04-14
npm run start
```

## 核心问题

长期使用的 LLM 助手会逐步形成关于任务、责任人、截止日期、依赖关系和限制条件的“工作记忆”。  
在会议后续协作场景中，这些记忆会直接影响下游行动，例如：

- 谁负责什么
- 哪项任务何时完成
- 哪些依赖必须先满足
- 哪些风险仍未解决
- 哪些决定已经确定，哪些仍处于待确认状态

真正的风险并不只是“纪要总结得不准”，而是：

**AI 会带着错误记忆继续参与后续协调，并据此给出错误建议、错误重规划和错误判断，而用户又未必知道 AI 当前到底记住了什么。**

因此，本研究关注的不是一般性的会议总结质量，而是：

**长期协作型 AI 助手的记忆，是否应该被设计成一个可被用户治理的交互对象。**

## 研究主张

本研究的中心主张是：

**在会议后续协作中，给用户提供可查看、可编辑的 AI 记忆层，能够帮助用户发现和修复 AI 的错误记忆，并进一步改善下游协调任务的质量。**

更具体地说，我们要回答：

- 用户能否通过查看记忆建立更准确的系统心智模型
- 用户能否通过直接编辑记忆，比只靠自然语言澄清更快、更准地修复错误
- 记忆可治理性是否真的会改善下游协作任务，而不只是让用户“感觉更透明”

## 推荐论文标题方向

- `面向 AI 会议后续助手的可查看与可编辑记忆`
- `长期协作型 AI 助手中的记忆治理`
- `修复 AI 在会议后续工作中的错误记忆`

英文工作标题可保留为：

- `Inspectable and Editable Memory for AI Meeting Follow-Up Assistants`

## 为什么选择会议后续协作

在目前讨论过的多个任务域中，会议后续协作是最适合这篇论文的主场景，因为它同时满足：

- 记忆在任务中天然重要
- 错误记忆有真实的下游后果
- 可从 transcript 中标注 gold reference
- 可以构造客观评分规则
- 任务具有现实工作场景意义
- 不会像开放式旅游规划那样难以验证

此外，这个场景比“纪要生成”更强，因为我们不是要测 AI 会不会复述，而是要测：

**AI 会不会基于错误记忆做出错误协调判断，以及用户能否治理这种错误。**

## 当前确定的研究 framing

### 一句话 framing

把 AI 记忆视为协作工作中的可治理系统状态，而不是隐藏在后台、持续影响协调决策的黑箱状态。

### 核心研究对象

会议后续协作助手中的结构化工作记忆，以及用户对该记忆的检查、修复与问责实践。

### 核心研究结果

- 错误记忆发现
- 错误记忆修复
- 下游协作任务质量
- 控制感
- 校准后的信任
- 协作中的可问责性与 repair 行为

## 主要研究贡献

### 1. 实证贡献

比较三种记忆条件对协作任务的影响：

- `Hidden`
- `Visible-Readonly`
- `Visible-Editable`

### 2. 系统贡献

构建一个支持记忆检查、修复与证据追溯的会议后续协作助手原型。

### 3. 设计知识贡献

产出关于长期协作型 AI 助手中“状态治理与协作修复”的设计启发，例如：

- 何时需要暴露记忆
- 如何支持低成本修复
- 如何表示不确定性
- 如何避免用户对可见记忆的盲目信任
- 如何让用户对 AI 协作状态建立可问责的心智模型

## 第一篇论文的范围

### 研究范围内

- 会议 transcript 驱动的后续协作
- 结构化记忆提取
- 记忆查看与编辑
- 下游协调任务
- 用户行为与结果评估

### 第一篇论文暂不覆盖

- 会议音频转写准确率
- 实时会议中介入式 agent
- 日历、邮件、项目管理平台集成
- 多人协同编辑
- 真正的组织级部署
- 大规模长期 field deployment

## 实验任务的最终组合

当前已经确定不用“follow-up email / action list / owner-deadline QA”作为主任务，而改为以下更强的任务组合：

### 主任务：冲突消解与重规划

参与者需要在新约束出现后，基于会议记忆重新安排任务、责任和时序。

例子：

- 某责任人不可用
- 某前置依赖被延迟
- 截止时间被提前
- 外部审批未按预期通过

这个任务最能体现：

- AI 是否保留了正确约束
- AI 是否能发现依赖冲突
- 错误记忆是否会直接导致错误协调决策

### 辅任务 1：风险与阻塞分析

参与者需要让助手识别：

- 当前 top risks
- blockers
- 仍待确认的问题
- 潜在升级点

这个任务特别适合测：

- `open_issue` 是否被错误当作已决定
- `constraint` 是否被遗漏
- 用户是否能通过查看记忆发现潜在误差

### 辅任务 2：决策一致性审计

参与者需要判断某个后续行动提案是否与原会议结论一致。

例子：

- 现在能不能直接发公告
- 功能是否能在本周上线
- 这个实验是否已经批准开始招募

这个任务本质上是在测：

- AI 是否保存了正确决策状态
- AI 是否错误“脑补”已经敲定的事项
- 用户是否能纠正 AI 对会议结论的错误理解

## 系统原型的最小闭环

第一版原型只需要覆盖实验所需最小能力：

1. 输入会议 transcript 或 transcript 风格对话
2. 提取并维护结构化记忆
3. 按实验条件暴露或隐藏记忆层
4. 在后续任务中基于当前记忆进行响应
5. 记录参与者的查看、编辑和修复行为

## 记忆模块的设计原则

结合近期相关 HCI 论文与当前研究目标，第一版记忆模块不应被做成“后台偷偷使用的摘要/向量记忆”，而应被设计成一个**用户可治理的中间表示层**。

### 原则 1：生效记忆与候选更新分离

系统不应让 AI 直接覆盖当前生效记忆，而应采用两层结构：

- `Active Memory`：当前真正参与下游任务的生效记忆
- `Proposed Updates`：AI 从 transcript、新冲突或后续对话中抽取出的候选更新

候选更新必须先经过冲突检测与用户审查，才能进入 Active Memory。

### 原则 2：记忆更新应可审核，而非直接覆盖

记忆更新流程应为：

1. AI 提出候选更新
2. 系统检测与已有记忆的冲突
3. 用户接受、拒绝或修改
4. 仅已确认的更新进入 Active Memory

这能避免“AI 自己改记忆、自己再基于新记忆做判断”的黑箱闭环。

### 原则 3：每条记忆都应有来源证据

用户不应该只看到结论，还应能看到：

- 该记忆来源于 transcript 的哪一段
- 这条记忆是 AI 提取的还是用户补充/修改的
- 这条记忆最近一次何时被更新

### 原则 4：显式表示不确定性与未决事项

`open_issue` 不能与已确认事实混在一起。  
系统应允许：

- 标记某条记忆为“不确定”
- 区分“已决定”与“待确认”
- 避免把开放问题误当作已敲定结论

### 原则 5：默认简洁，冲突时展开

平时用户主要看到精简的 Active Memory。  
当出现冲突、候选更新或高风险任务时，再展开：

- 变更 diff
- 冲突说明
- 来源证据
- 影响范围

### 原则 6：不仅展示记忆，还要展示记忆如何影响输出

用户应能看到某次回答或重规划使用了哪些记忆项，而不只是“系统记住了什么”。  
这有助于用户理解：

- 哪些错误记忆影响了结果
- 哪些修复真正改变了下游判断

## 记忆模块的信息架构

当前建议的记忆模块包含五个核心区块：

### 1. Active Memory

当前生效、会被系统用于下游任务的结构化记忆。

### 2. Proposed Updates

AI 自动提出、尚未正式生效的候选更新。  
用户可在这里：

- 接受
- 拒绝
- 编辑后接受
- 标记不确定

### 3. Conflict Queue

集中展示冲突项，例如：

- owner conflict
- deadline conflict
- dependency conflict
- constraint omission
- open issue mistaken as resolved

### 4. Source Evidence

展示每条记忆对应的 transcript 来源，帮助用户核对系统依据。

### 5. Usage Trace

展示某次回答、风险分析或重规划过程中，系统实际调用了哪些 Active Memory 条目。

## 记忆模块的推荐交互

第一版建议支持的操作：

- `accept`
- `reject`
- `edit`
- `delete`
- `add`
- `mark uncertain`
- `archive`

其中第一篇论文的主实验重点应放在：

- 查看
- 编辑
- 删除
- 补充
- 标记不确定

`archive` 可以作为实现预留，不必在主实验中强依赖。

## 推荐的记忆生命周期

建议采用以下统一生命周期：

1. transcript 或新事件进入系统
2. AI 抽取 candidate memory
3. 系统与 Active Memory 对比并检测冲突
4. 生成 Proposed Updates 与 Conflict Queue
5. 用户审核和修复
6. 已确认更新写入 Active Memory
7. 下游任务仅调用 Active Memory
8. 系统记录本轮输出使用了哪些记忆

这套生命周期是本项目的重要设计主张之一。

## 记忆结构

第一篇论文中，记忆 schema 保持精简，避免变量过多。

- `task`
- `owner`
- `deadline`
- `dependency`
- `constraint`
- `open_issue`

建议每条记忆包含：

- 唯一 ID
- 类型
- 内容
- 来源引用
- 状态或置信度
- 创建/更新来源

进一步建议数据字段包含：

- `id`
- `type`
- `content`
- `owner`
- `deadline`
- `status`
- `source_ref`
- `confidence`
- `origin`
- `version`
- `active`
- `conflict_state`
- `used_in_last_response`
- `updated_at`

## 实验条件

- `Hidden`：用户不能查看记忆，只能继续对话
- `Visible-Readonly`：用户可以查看记忆，但不能直接修改
- `Visible-Editable`：用户可以查看、编辑、删除和补充记忆

### 条件与模块权限映射

#### Hidden

- 不显示 Active Memory
- 不显示 Proposed Updates
- 不显示 Conflict Queue
- 不显示 Source Evidence
- 不显示 Usage Trace

#### Visible-Readonly

- 显示 Active Memory
- 显示 Proposed Updates，但仅查看
- 显示 Conflict Queue
- 显示 Source Evidence
- 可查看 Usage Trace
- 不允许修改、删除、新增、接受或拒绝更新

#### Visible-Editable

- 显示 Active Memory
- 显示 Proposed Updates
- 显示 Conflict Queue
- 显示 Source Evidence
- 显示 Usage Trace
- 允许编辑、删除、补充、接受、拒绝和标记不确定

## 初步假设

- `H1`：记忆可见性会提高用户对系统状态的理解和控制感
- `H2`：直接编辑记忆会提高错误修复成功率
- `H3`：可编辑记忆会提高下游重规划与协调任务的准确性
- `H4`：可编辑记忆会带来一定交互成本，但总体提升校准后的信任和任务结果

## 核心因变量

### 客观指标

- 错误记忆发现率
- 错误记忆修复率
- 重规划正确率
- 依赖关系保持正确率
- 截止时间正确率
- 风险识别正确率
- 决策一致性判断正确率
- 完成任务所需时间
- 从发现问题到恢复正确状态所需轮数

### 主观指标

- perceived control
- trust
- reliance calibration
- workload
- usability

## 当前确定的开发策略

- 使用同域名新路径挂实验页面
- 使用独立目录开发实验功能
- 不污染现有 `showcase/studio/chat` 产品链路
- 前后端都使用新的命名空间和数据表
- 第一版先用静态场景，不接真实会议或音频

## 当前最重要的风险

- 任务设计退化成“纪要纠错”
- 下游任务评分仍然不够客观
- schema 太复杂导致参与者学习成本过高
- editable 条件过于自由，影响分析解释
- 原型实现过于靠近现有产品逻辑，污染实验控制

## 近期执行顺序

1. 固定完整实验场景与 gold annotation
2. 设计前端实验页面与独立交互流
3. 设计后端 session / memory / logging / export API
4. 实现最小可跑原型
5. 跑 5-8 人 pilot
6. 调整任务和难度
7. 进入主实验

## 相关文档

- [实验计划](./docs/EXPERIMENT_PLAN.md)
