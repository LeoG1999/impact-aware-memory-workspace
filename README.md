# Impact-Aware Memory Workspace

## Proposal

### Working Title

**From Editable Memory to Appropriate Reliance: Designing Impact-Aware Memory Workspaces for AI Assistants**

### Motivation

Persistent AI assistants increasingly rely on remembered user preferences, constraints, and prior interactions to shape future recommendations. In practice, this remembered state is often hidden, stale, over-inferred, or wrong. When this happens, assistants can produce fluent but misaligned outputs, while users are left guessing whether the problem lies in the current prompt, the model's reasoning, or the assistant's memory of the user.

Recent HCI work has studied transparency, provenance, shared representations, and editable AI specifications. However, there is still a gap between making AI state visible and helping users understand how that state drives downstream behavior. In particular, we know little about whether exposing editable memory together with its behavioral consequences can help users both repair the system more effectively and rely on it more appropriately.

### Core Idea

This project proposes an **impact-aware memory workspace** for AI assistants. Instead of presenting memory as a hidden backend or a static editable list, the interface treats remembered state as a user-facing interaction object. Users can inspect and repair memory items directly, while also seeing:

- where a memory item came from
- how certain the system is about it
- whether it conflicts with other remembered information
- which previous outputs relied on it
- what kinds of future recommendations are likely to change if it is edited

The central design claim is:

**Users should not only see what the assistant remembers, but also how that remembered state shapes assistant behavior.**

### Research Questions

- Does editable memory improve users' mental models of an assistant's current state compared with chat-only interaction?
- Does impact preview improve users' ability to detect and repair incorrect memory beyond editable memory alone?
- Does impact-aware memory reduce overreliance on flawed assistant recommendations and support more appropriate reliance after repair?
- What tradeoffs emerge between user control, cognitive effort, and downstream decision quality?

### Proposed Study

The first version will focus on a constrained recommendation assistant, most likely in a dining domain. This gives us a task space with clear preferences and hard constraints such as budget, dietary needs, distance, and time window. The assistant will maintain a structured memory of these attributes and use them to produce recommendations. Some memory items will be intentionally wrong, stale, omitted, or over-confident.

We will compare three interface conditions:

- `Chat-only`
- `Editable Memory`
- `Editable Memory + Impact Preview`

Participants will complete short tasks such as selecting among recommendations, auditing whether a recommendation matches the true user state, and revising recommendations after correcting memory. Primary measures will include mental model accuracy, memory error detection, repair success, downstream decision quality, and appropriate reliance.

### Expected Contribution

The project aims to contribute:

- an interaction concept for impact-aware editable AI memory
- empirical evidence on how memory visibility and impact visibility shape repair and reliance
- design guidance for exposing assistant memory as a manipulable interaction layer rather than a hidden internal state

## Current Implementation Plan

### 1. Freeze the first experimental frame

The immediate goal is not to broaden the system, but to lock a defensible first study:

- choose a single primary domain, currently `dining` by default
- finalize a compact memory schema
- define a small set of controlled memory error types
- specify exactly what the impact preview reveals
- lock a `3-condition within-subjects` study with `3 pilot packs` and `6 main-study packs`

### 2. Build a controlled prototype

The prototype should be deterministic rather than driven by a live model. The goal is to isolate interface effects, not model variance. The prototype will include:

- a recommendation panel
- a structured memory workspace
- direct memory repair actions
- an impact preview panel
- event logging for inspections, edits, and decisions

### 3. Author short scenario packs

We need a small set of tightly controlled scenarios, each with:

- a true user state
- an assistant memory state
- one or more injected memory problems
- candidate recommendations
- gold outcomes for scoring

The current study target is:

- `pilot`: 3 scenario packs, 6 to 8 participants
- `main study`: 6 scenario packs, 30 effective participants

### 4. Run pilot before expanding scope

Before building a full study, we should pilot:

- whether participants understand the memory workspace
- whether impact preview is actually used
- whether the tasks cleanly separate inspection, repair, and reliance
- whether the error difficulty is neither trivial nor opaque

### 5. Write toward CHI

The intended paper should foreground:

- malleable AI memory as a new interaction object
- repair as a mechanism for calibrated reliance
- impact visibility as the step beyond simple memory editability

## Project Files

- [docs/PROPOSAL_V1.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/PROPOSAL_V1.md)
- [docs/RELATED_WORK_V1.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/RELATED_WORK_V1.md)
- [docs/STUDY_DESIGN_V1.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/STUDY_DESIGN_V1.md)
- [docs/PILOT_PACKS_V1.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/PILOT_PACKS_V1.md)
- [docs/TASK_FRAMEWORK.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/TASK_FRAMEWORK.md)
- [docs/ROADMAP.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/ROADMAP.md)
- [docs/UI_DIRECTION_CHI_V1.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/UI_DIRECTION_CHI_V1.md)
- [prototype/frontend/index.html](/home/ec2-user/workspace/impact-aware-memory-workspace/prototype/frontend/index.html)

---

# Impact-Aware Memory Workspace 中文版

## 研究提案

### 工作标题

**从可编辑记忆到适当依赖：为 AI 助手设计具备影响预览的记忆工作区**

### 研究动机

长期使用的 AI 助手越来越依赖它们所记住的用户偏好、约束和过往交互，并用这些记忆来影响后续推荐。但在实际使用中，这些被记住的状态往往是隐藏的、过期的、过度推断的，甚至是错误的。当这种情况发生时，AI 助手仍然可能生成流畅但不符合用户真实需求的输出，而用户很难判断问题到底来自当前提示词、模型推理，还是助手对用户的记忆本身。

近期 HCI 研究已经关注透明性、来源追踪、共享表示和可编辑的 AI 规格。然而，仅仅让 AI 状态可见，并不等于用户能够理解这些状态如何影响后续行为。尤其是，我们仍然缺少对一个问题的理解：当用户不仅可以编辑 AI 记忆，还能看到这些记忆对系统行为的后续影响时，他们是否能更有效地修复系统，并更适当地依赖 AI 输出。

### 核心想法

本项目提出一种 **impact-aware memory workspace**，即具备影响预览的 AI 记忆工作区。我们不把 AI 记忆设计成隐藏的后端状态，也不把它做成静态的可编辑列表，而是将它作为用户可以直接交互的对象。用户可以检查并修复记忆条目，同时看到：

- 某条记忆来自哪里
- 系统对这条记忆有多确定
- 它是否与其他记忆发生冲突
- 哪些历史输出曾经依赖它
- 如果编辑它，哪些未来推荐可能发生变化

本项目的核心设计主张是：

**用户不应只看到 AI 助手记住了什么，还应看到这些被记住的状态如何塑造助手的行为。**

### 研究问题

- 与纯聊天交互相比，可编辑记忆是否能改善用户对 AI 助手当前状态的心智模型？
- 除了可编辑记忆本身，影响预览是否能进一步帮助用户发现并修复错误记忆？
- 具备影响预览的记忆工作区是否能减少用户对错误推荐的过度依赖，并在修复后支持更适当的依赖？
- 当 AI 记忆变成可操作对象后，用户控制、认知成本和下游决策质量之间会出现什么权衡？

### 拟议实验

第一版研究将聚焦一个受控的推荐助手场景，目前默认使用餐厅推荐领域。这个领域包含清晰的偏好和硬约束，例如预算、饮食限制、距离和时间窗口。助手会维护一组结构化记忆，并基于这些记忆生成推荐。部分记忆会被有意设置为错误、过期、遗漏或过度确定。

我们将比较三种界面条件：

- `Chat-only`
- `Editable Memory`
- `Editable Memory + Impact Preview`

参与者将完成一组短任务，例如在候选推荐中做选择、审计某个推荐是否符合用户真实状态，以及在修复记忆后重新做出推荐决策。主要测量指标包括心智模型准确性、记忆错误发现率、修复成功率、下游决策质量和适当依赖。

### 预期贡献

本项目旨在贡献：

- 一种具备影响预览的可编辑 AI 记忆交互概念
- 关于记忆可见性和影响可见性如何影响修复与依赖的实证证据
- 关于如何将 AI 助手记忆设计为可操作交互层，而不是隐藏内部状态的设计启发

## 当前实施思路

### 1. 冻结第一版实验框架

当前目标不是继续扩大系统范围，而是先锁定一个可辩护的第一版实验：

- 选择单一主领域，目前默认是 `dining`
- 固定一套紧凑的记忆 schema
- 定义少量可控的记忆错误类型
- 明确影响预览到底展示什么信息
- 固定一个 `3-condition within-subjects` 实验设计，包含 `3 pilot packs` 和 `6 main-study packs`

### 2. 构建受控原型

原型应采用确定性逻辑，而不是依赖实时模型输出。这样可以隔离界面机制的影响，避免模型波动干扰实验结果。原型将包括：

- 推荐面板
- 结构化记忆工作区
- 直接记忆修复操作
- 影响预览面板
- 针对检查、编辑和决策行为的事件日志

### 3. 编写短场景包

我们需要一组小而受控的场景包，每个场景包包含：

- 真实用户状态
- 助手当前记忆状态
- 一个或多个注入的记忆问题
- 候选推荐项
- 用于评分的标准答案

当前实验目标是：

- `pilot`：3 个 scenario packs，6 到 8 名参与者
- `main study`：6 个 scenario packs，30 名有效参与者

### 4. 先 pilot，再扩大范围

在构建完整实验前，需要先通过 pilot 检查：

- 参与者是否理解记忆工作区
- 参与者是否实际使用影响预览
- 任务是否能清楚区分检查、修复和依赖行为
- 错误难度是否既不明显到无意义，也不隐蔽到不可发现

### 5. 面向 CHI 写作

目标论文应突出：

- 可塑 AI 记忆作为一种新的交互对象
- 记忆修复作为校准依赖的机制
- 影响可见性作为超越单纯记忆可编辑性的关键步骤

## 项目文件

- [docs/PROPOSAL_V1.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/PROPOSAL_V1.md)
- [docs/RELATED_WORK_V1.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/RELATED_WORK_V1.md)
- [docs/STUDY_DESIGN_V1.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/STUDY_DESIGN_V1.md)
- [docs/PILOT_PACKS_V1.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/PILOT_PACKS_V1.md)
- [docs/TASK_FRAMEWORK.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/TASK_FRAMEWORK.md)
- [docs/ROADMAP.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/ROADMAP.md)
- [docs/UI_DIRECTION_CHI_V1.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/UI_DIRECTION_CHI_V1.md)
- [prototype/frontend/index.html](/home/ec2-user/workspace/impact-aware-memory-workspace/prototype/frontend/index.html)
