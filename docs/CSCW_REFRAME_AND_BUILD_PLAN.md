# CSCW 导向重构与编码计划

## 一、目标重述

如果以 `CSCW 2027` 为主目标，这个项目不应再被表述为一个“更透明的 AI 助手 UI 研究”，而应被表述为：

**在会议后续协作中，AI 的内部记忆本质上是一种会持续影响协调、责任分配和决策判断的系统状态；当这类状态可被用户查看、质疑、修复和追溯时，协作中的 repair、accountability 和 coordination quality 是否会改善。**

这一定义更贴近 CSCW 对以下问题的关注：

- 协作与协调工作
- articulation work
- breakdown 与 repair
- 可问责的 sociotechnical system
- AI 在工作场景中的组织后果

## 二、当前方案中适合保留的部分

以下设计与 `CSCW` 方向高度兼容，应保留：

- 会议后续协作作为主场景
- 错误记忆影响后续协调决策这一核心问题
- `Hidden` / `Visible-Readonly` / `Visible-Editable` 三条件
- 主任务设为“冲突消解与重规划”
- 结构化记忆 schema
- 来源证据、冲突显示、未决事项显式表示
- 日志记录与行为分析

## 三、需要优化的地方

## 3.1 研究 framing 需要从“透明性”转向“协作治理”

当前文本里仍有较强的 `IUI/CHI` 语气，例如：

- inspectability
- editability
- perceived control
- trust calibration

这些概念可以保留，但在 `CSCW` 论文中不能成为唯一主线。  
应改为以下主线排序：

1. 协作中的错误状态如何影响后续 coordination
2. 用户如何发现、解释、修复 AI 的错误工作记忆
3. 可治理记忆如何支持 repair 与 accountability
4. control / trust 作为次级结果变量

建议把论文主问题改写成：

- AI 的错误工作记忆如何在会议后续协作中造成 coordination breakdown
- 用户在不同记忆治理条件下如何执行 repair
- 哪类记忆表示与治理机制能更好支持协作问责

## 3.2 实验不应只证明“可见更好”

如果论文结果只是：

- visible 比 hidden 好
- editable 比 readonly 好

这在 `CSCW` 审稿里会显得过于直接，像功能比较。  
需要补强“为什么这种差异在协作中重要”。

建议增加两个分析重点：

- `repair trajectories`：用户如何定位、确认、修复错误记忆
- `accountability reasoning`：用户如何利用来源证据、冲突和未决状态判断是否该相信系统

这意味着最终分析不应只有正确率和时间，还要有行为模式编码。

## 3.3 需要降低“系统智能”带来的实验噪声

当前设计里有“AI 提出候选更新、在后续任务中基于记忆响应”的描述。  
如果直接接入实时 LLM，会引入难以控制的方差：

- 同条件不同轮输出不稳定
- 错误注入与输出质量纠缠
- 难以判断差异来自界面还是来自模型波动

编码阶段建议把第一版原型做成**受控研究系统**而不是“真实智能助手”：

- transcript、gold memory、错误注入、冲突事件都预先结构化
- assistant response 采用规则模板或半模板生成
- usage trace 由程序基于 active memory 显式生成
- proposed updates 由预置规则或场景数据驱动，不依赖在线模型

这样更符合 CSCW 对内部效度的要求，也更适合做 pilot。

## 3.4 需要限制 editable 条件的编辑自由度

当前开放问题之一是是否允许自由文本编辑。  
对于第一版，建议不要开放自由文本大改写，而是采用：

- 字段级编辑
- 新增结构化条目
- 删除条目
- 标记 uncertain
- 接受 / 拒绝 proposed update

原因：

- 更好记录 repair 行为
- 更便于规则评分
- 更容易比较不同参与者
- 更适合后续做定量分析

## 3.5 需要处理 within-subject 的 carryover 风险

当前方案采用 `within-subjects` 没问题，但要加两项控制：

- 每个条件使用不同场景
- 三个场景先做难度等价预检

否则参与者会在第二、第三轮学会“你们总会埋哪些错”，从而污染结果。

建议：

- 使用 Latin square 或完整 counterbalancing
- 每个场景固定错误类型组合，但不要完全相同
- pilot 专门测试场景难度与错误显著度

## 3.6 需要把“会议后续协作”写得更像工作实践

当前三个场景是合理的，但还偏任务化。  
为了更像 `CSCW`，需要在材料和论文叙事中强化：

- 责任交接
- 依赖协调
- 未决事项的持续跟踪
- 跨角色的信息不对称
- 错误状态如何影响实际协作推进

也就是说，场景文字和任务指令要少一点“答题感”，多一点“继续推进工作”的语境。

## 3.7 需要提前设计质性材料

如果目标是 `CSCW`，只做问卷和指标会偏薄。  
建议在每个 condition 后加入极短反思问题，实验后加入简短半结构访谈。

最低限度应增加：

- 你什么时候开始怀疑系统记忆有问题
- 你依据什么决定修改或不修改记忆
- 哪些可见信息帮助你判断 AI 是否可靠

这样后面才能支撑 repair / accountability 的质性分析。

## 四、优化后的研究版本

## 4.1 建议研究问题

- `RQ1`：在会议后续协作中，暴露 AI 的工作记忆是否帮助用户建立对系统状态的可问责理解
- `RQ2`：当 AI 记错协作状态时，不同治理条件如何影响用户的 repair 行为与修复成功率
- `RQ3`：记忆治理是否改善下游协调任务质量，尤其是重规划、风险识别和决策一致性判断
- `RQ4`：用户在不同条件下如何形成、维持或撤回对 AI 协作状态的信任

## 4.2 建议核心贡献

### 实证贡献

说明可治理 AI memory 如何影响协作中的错误发现、repair 与 coordination outcomes。

### 系统贡献

实现一个可追溯、可修复、支持冲突暴露的会议后续协作原型。

### 设计知识贡献

提出面向协作型 AI 的 state governance 原则，包括：

- 何时暴露状态
- 如何显示冲突与未决事项
- 如何支持低成本 repair
- 如何使系统状态具备可问责性

## 五、编码前应冻结的设计决策

开始写代码前，建议先固定以下决策，不再继续开放：

### 5.1 技术策略

第一版采用**受控原型**，不接在线 LLM。

### 5.2 编辑策略

第一版只支持结构化编辑，不支持任意自由文本重写整段 memory。

### 5.3 输出策略

assistant output 采用模板化或规则化生成，确保同状态下输出稳定。

### 5.4 冲突轮次

第一版每个场景只保留 **1 轮新增冲突**。  
不要在第一版引入两轮递进冲突。

### 5.5 任务范围

只实现三类任务：

- 重规划
- 风险与阻塞分析
- 决策一致性审计

### 5.6 访谈与问卷

每个条件后固定 2-3 个短答题；实验末尾固定一组半结构访谈问题。

## 六、编码优先级

编码不应从 UI 细节开始，而应从实验资产和状态模型开始。

### Phase 1：场景数据层

先实现统一的场景目录与 JSON schema：

- `transcript.json`
- `gold_memory.json`
- `seed_active_memory.json`
- `proposed_updates.json`
- `conflicts.json`
- `tasks.json`
- `scoring_rubric.json`

这一层完成后，原型才能稳定驱动。

### Phase 2：研究状态机

实现 session 状态机：

- participant
- condition
- scenario
- step
- active memory
- proposed updates
- conflict queue
- task responses
- event log

### Phase 3：受控 assistant 层

实现一个 deterministic responder：

- 输入：`active memory + task prompt + scenario state`
- 输出：结构化回答
- 同时产出 `usage trace`

### Phase 4：研究 UI

最小 UI 模块：

- transcript viewer
- memory panel
- proposed updates
- conflict queue
- task workspace
- questionnaire

### Phase 5：日志与评分

实现：

- event log writer
- session export
- memory diff evaluator
- task scoring scripts

## 七、下一步执行计划

建议按以下顺序直接开始。

### Step 1：本周先完成研究资产建模

交付物：

- 场景目录结构
- 全部 JSON schema 初版
- 一个完整场景样例

完成标准：

- 不写 UI 也能在终端里加载一个场景对象
- 场景对象能驱动一次完整 session walkthrough

### Step 2：实现后端核心域模型

交付物：

- `Scenario`
- `MemoryItem`
- `ProposedUpdate`
- `ConflictItem`
- `SessionState`
- `EventLogEntry`

完成标准：

- 能创建 session
- 能按条件切换权限
- 能执行一次 memory edit / accept / reject / mark uncertain

### Step 3：实现 deterministic responder

交付物：

- 重规划回答生成器
- 风险分析回答生成器
- 一致性审计回答生成器

完成标准：

- 输出只依赖 active memory
- 当 active memory 改变时，回答和 usage trace 一起改变

### Step 4：实现最小研究 UI

交付物：

- 单页实验界面
- 条件切换
- transcript + memory + tasks 三栏布局

完成标准：

- 可跑通单个场景
- 可导出本次 session 结果

### Step 5：补日志与评分

交付物：

- 事件日志
- 自动评分脚本
- 导出 CSV / JSON

完成标准：

- 一次完整 session 结束后可自动产出关键指标

## 八、建议的代码仓结构

```text
docs/
  EXPERIMENT_PLAN.md
  IMPLEMENTATION_PLAN.md
  CSCW_REFRAME_AND_BUILD_PLAN.md
scenarios/
  schema/
  launch/
  research/
  outage/
prototype/
  backend/
    src/
      domain/
      services/
      routes/
  frontend/
    src/
      components/
      pages/
      state/
analysis/
  scoring/
  exports/
ops/
  interview_guide.md
  questionnaire.md
```

## 九、现在最值得立刻做的事

不是先搭前端，而是：

1. 固定 `scenario JSON schema`
2. 固定 `session state schema`
3. 固定 `event log schema`
4. 用一个场景打通从加载、修复到评分的命令行闭环

这样下一步再写 Web 原型，返工会少很多。
