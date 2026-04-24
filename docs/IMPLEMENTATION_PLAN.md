# 实施方案

## 一、目标

本实施方案用于把现有实验计划转化为可执行的研究与工程落地路径，覆盖：

- 实验材料生产
- 原型系统实现
- 日志与评分基础设施
- pilot 执行
- main study 执行
- 数据分析与论文产出

核心目标不是做一个完整的会议助手产品，而是在 8 周内交付一个足以支撑受控实验的研究原型与完整实验流程。

## 二、实施原则

### 2.1 研究优先

所有实现必须服务于以下研究主线：

- `memory governance`
- 错误记忆发现与修复
- 下游协作任务质量

凡是不直接支持实验变量、任务执行、日志记录或评分的功能，默认不进入第一版。

### 2.2 最小闭环优先

第一版只实现实验闭环所需能力：

1. 导入 transcript
2. 展示或隐藏结构化记忆
3. 支持记忆查看与治理
4. 完成三类后续任务
5. 记录行为日志与导出数据

### 2.3 规则可判优先

任务结果、记忆状态和修复行为应尽量结构化，避免把关键评分建立在开放式人工主观判断上。

### 2.4 条件一致性优先

三种实验条件的差异只能体现在记忆治理权限上，其他界面、任务材料、冲突强度、模型能力和日志机制必须保持一致。

## 三、范围定义

### 3.1 本阶段必须完成

- 3 个实验场景材料定稿
- gold memory 与错误注入版本定稿
- `Hidden` / `Visible-Readonly` / `Visible-Editable` 三条件原型
- transcript viewer、memory panel、task panel、questionnaire
- Active Memory / Proposed Updates / Conflict Queue / Source Evidence / Usage Trace
- 编辑、删除、新增、接受、拒绝、标记 uncertain
- 条件分配、顺序控制、日志导出
- 规则评分脚本与人工 rubric

### 3.2 本阶段不做

- 实时会议接入
- 音频转写
- 外部工具集成
- 多用户协同
- 自动执行真实任务
- 长期 field deployment

## 四、工作流拆解

实施分为 5 条并行但有依赖的工作流。

### 4.1 工作流 A：研究材料与标注

目标是把实验 plan 转为可直接上机的标准化材料。

交付物：

- 3 个场景 transcript
- 每个场景的 `gold memory`
- 每个场景的错误注入版本
- 每个场景的新增冲突事件
- 3 类任务题面
- 规则评分表
- 任务说明与主持人脚本

关键动作：

1. 为每个场景建立统一数据包目录。
2. 把六类 memory schema 标注为结构化 JSON。
3. 为每个场景固定 2-3 个错误注入点。
4. 为主任务和两个辅任务分别写 gold answer 与评分规则。
5. 进行一次内部双人复核，确保 transcript、gold memory、错误注入和评分标准一致。

完成标准：

- 任一场景可以在不依赖口头解释的情况下独立运行。
- 两位研究人员对 gold scoring 的一致率达到可接受水平。

### 4.2 工作流 B：研究原型实现

目标是实现受控实验用原型，而不是开放式产品。

前端模块：

- `Transcript Viewer`
- `Memory Panel`
- `Task Workspace`
- `Conflict Review`
- `Questionnaire`
- `Researcher Admin Export`

后端模块：

- session 管理
- condition 分配
- scenario 配置加载
- memory 状态管理
- interaction log API
- result export API

建议信息流：

1. 加载场景 transcript 与初始 Active Memory
2. 按条件控制 memory 模块权限
3. 注入错误记忆作为系统初始状态
4. 在实验中段推送新增冲突
5. 用户执行任务并触发记忆查看/修复
6. 系统生成回答并记录 usage trace
7. 保存结果与问卷

完成标准：

- 三种条件切换无逻辑分叉错误。
- 所有关键交互均可记录。
- 任一 session 可完整导出。

### 4.3 工作流 C：日志、评分与分析基础设施

目标是让实验数据能直接进入统计与质性分析。

日志必须覆盖：

- session id
- participant id
- scenario id
- condition
- counterbalance order
- 页面进入时间
- transcript 浏览行为
- memory panel 打开与停留时间
- 记忆查看对象
- 编辑前后 diff
- accept / reject / delete / add / mark uncertain
- 用户输入
- 助手输出
- usage trace
- 任务提交结果
- 问卷结果

评分基础设施包括：

- memory-level scoring
- task-level scoring
- 自动计算发现率、修复率、正确率、用时
- 数据清洗脚本
- 导出为统计分析友好的表格格式

完成标准：

- 对一条完整 session，能自动产出 participant-level 指标表。
- 对编辑行为，能回放“何时发现、何时修复、修复是否成功”。

### 4.4 工作流 D：Pilot 与修订

目标是在主实验前暴露材料和交互问题。

pilot 重点检查：

- 参与者是否理解三类任务
- 错误注入是否足够明显但不过度直白
- 冲突事件是否能稳定触发修复行为
- readonly 与 editable 条件差异是否足够清晰
- 日志是否完整
- 评分规则是否可执行

pilot 后必须形成：

- 问题清单
- 修订优先级
- 场景与界面修订记录
- 主实验冻结版本

### 4.5 工作流 E：主实验与论文产出

目标是完成主实验执行、分析和写作。

交付物：

- 主实验数据集
- 定量分析结果
- 质性编码结果
- 图表草案
- 论文大纲与初稿

## 五、系统实施架构

### 5.1 数据对象

建议最少定义以下对象：

- `Scenario`
- `TranscriptSegment`
- `MemoryItem`
- `ProposedUpdate`
- `ConflictItem`
- `TaskInstance`
- `Session`
- `EventLog`
- `QuestionnaireResponse`

### 5.2 MemoryItem 建议字段

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
- `created_by`
- `updated_by`
- `updated_at`

### 5.3 状态分层

必须明确区分：

- `Active Memory`
- `Proposed Updates`
- `Conflict Queue`

下游任务只读取 `Active Memory`。  
这条约束应写死在系统逻辑中，避免实验条件混淆。

### 5.4 条件控制方式

建议把条件实现为权限配置，而不是三套独立页面：

- `Hidden`: 面板不可见，治理操作不可用
- `Visible-Readonly`: 面板可见，治理操作禁用
- `Visible-Editable`: 面板可见，治理操作启用

这样可降低实现复杂度，并减少条件间非目标差异。

## 六、8 周执行排期

### 第 1 周：材料冻结基础版

目标：

- 固定 RQ、假设、schema、错误 taxonomy
- 完成 3 个场景的 transcript v1
- 完成 gold memory v1

产出：

- 场景材料目录结构
- 场景 JSON 草案
- 评分字段定义

验收标准：

- 三个场景都能跑通纸面 walkthrough

### 第 2 周：原型骨架

目标：

- 建立实验前端与后端骨架
- 打通 session、scenario、condition 基础流程

产出：

- transcript viewer 基础页
- memory panel 基础页
- research API skeleton

验收标准：

- 可加载任一场景并显示对应条件

### 第 3 周：核心交互

目标：

- 实现 memory 查看与治理
- 实现 task workspace
- 实现冲突注入机制

产出：

- edit/delete/add/accept/reject/mark uncertain
- Active / Proposed / Conflict 三分层
- 冲突事件推送

验收标准：

- 能完成一条端到端实验流程，不要求美化

### 第 4 周：日志与评分

目标：

- 接入完整日志
- 完成自动评分与 rubric 初版
- 做内部联调

产出：

- event log schema
- export endpoint
- scoring scripts v1

验收标准：

- 任一测试 session 均可导出并自动算出核心指标

### 第 5 周：Pilot

目标：

- 招募 `N=5-8`
- 跑 pilot
- 收集交互与理解问题

产出：

- pilot 观察记录
- bug list
- 修订清单

验收标准：

- 明确哪些问题必须在主实验前修复

### 第 6 周：修订与冻结

目标：

- 修界面与流程问题
- 固定正式材料
- 固定正式评分脚本

产出：

- frozen build
- frozen materials
- experiment runbook

验收标准：

- 研究团队可以按 runbook 独立主持实验

### 第 7 周：Main Study 执行

目标：

- 招募并运行 `N=24-30`
- 监控数据完整性

产出：

- 主实验原始数据
- 每日质量检查记录

验收标准：

- 无关键字段缺失
- counterbalance 执行正常

### 第 8 周：分析与写作

目标：

- 数据清洗
- 统计分析
- 质性编码
- 论文初稿

产出：

- analysis notebook / script
- 图表
- paper outline
- draft v1

验收标准：

- 能形成完整结果叙事：可见性、可编辑性、交互成本、设计启发

## 七、人员分工建议

若团队规模较小，建议至少按职责分为 4 个角色：

- `PI / Research Lead`：研究问题、实验设计、分析把关
- `Prototype Owner`：前后端原型与数据结构
- `Study Ops Owner`：招募、主持脚本、session 质量控制
- `Analysis Owner`：评分脚本、统计分析、可视化

如果只有 2 人，建议按以下方式压缩：

- 研究负责人：材料、主持、分析
- 工程负责人：原型、日志、导出、评分脚本

## 八、里程碑与验收门槛

### M1：材料可运行

通过标准：

- 3 个场景完成
- gold 与错误注入完成
- 评分规则成型

### M2：原型可闭环

通过标准：

- 三条件可切换
- 三类任务可执行
- 关键日志可记录

### M3：Pilot 通过

通过标准：

- 参与者能理解任务
- 条件差异显著
- 数据可用于评分

### M4：主实验冻结

通过标准：

- 不再新增功能
- 仅修阻断性问题

### M5：结果可写作

通过标准：

- 定量与质性结果均可支撑论文论证

## 九、主要风险与应对

### 风险 1：任务太像“总结纠错”，而不是“记忆治理”

应对：

- 把主任务始终固定为重规划
- 评分重点放在依赖、约束、未决事项和顺序调整

### 风险 2：Editable 条件收益不明显

应对：

- 保证注入错误会真实影响下游判断
- 保证 readonly 条件只能看、不能修
- 保证冲突足以触发修复需求

### 风险 3：评分过度依赖人工判断

应对：

- 尽量把 memory schema 与任务结果结构化
- 先定义可规则判定字段，再补高层 rubric

### 风险 4：日志不完整导致分析失败

应对：

- 第 4 周前完成日志 schema 冻结
- pilot 中专门验证日志完整性

### 风险 5：三条件存在额外界面差异

应对：

- 使用统一页面和统一布局
- 只通过权限和可见性切换条件

## 十、当前建议的立即行动

建议按以下顺序启动：

1. 先冻结 3 个场景的数据结构和 gold 标注格式。
2. 再实现统一的 session + condition + scenario 加载框架。
3. 然后实现 memory panel 的三层结构与治理操作。
4. 随后补齐日志、评分脚本和导出。
5. 最后再做 pilot 和材料修订。

这个顺序的原因是：材料结构如果不先冻结，后面的状态管理、日志定义和评分脚本都会反复返工。

## 十一、建议的目录结构

建议后续按如下方式组织研究资产：

```text
docs/
  EXPERIMENT_PLAN.md
  IMPLEMENTATION_PLAN.md
scenarios/
  launch/
    transcript.json
    gold_memory.json
    injected_memory.json
    conflicts.json
    tasks.json
    scoring_rubric.json
  research/
    ...
  outage/
    ...
prototype/
  frontend/
  backend/
analysis/
  scoring/
  notebooks/
ops/
  runbook.md
  consent.md
  questionnaire.md
```

## 十二、结论

基于现有实验计划，本项目最合理的实施方式不是“先做一个完整产品再想实验”，而是：

- 先冻结实验材料和评分逻辑
- 用统一权限模型实现三种记忆治理条件
- 把系统重点放在记忆状态、冲突处理、可追踪日志和可分析数据

这样可以在较短周期内得到一个研究上可 defend、工程上可维护、实验上可执行的最小原型。
