# 页面优化方案

## 当前主要问题

1. 首次进入后，用户不知道实验目标是什么，也不知道先读 transcript 还是先点按钮。
2. `Session / Workflow / Transcript / Memory / Updates / Tasks / Outputs` 都是并列面板，信息层级太平，缺少主线。
3. 用户无法快速判断当前到底运行的是 `GPT-4.1` 还是 fallback 模式。
4. `Visible-Editable` 条件下可操作项很多，但没有“下一步建议”，容易把实验做成随意点击。
5. 研究者需要的是受控流程，当前界面更像开发调试台。

## 优化目标

- 让参与者在 10 秒内理解“这是什么、我现在该做什么、下一步是什么”。
- 把研究流程从“工具箱”改成“向导式任务流”。
- 让系统状态、实验条件和模型状态始终可见。
- 保留研究所需的透明度与导出能力，但把高级操作降级为二级信息。

## 已落地的第一轮改动

- 顶部增加更明确的研究说明和语言切换。
- 增加 `System Status` 区域，显示当前 responder 模式、模型、是否 fallback。
- 增加 `Recommended Next Step`，根据当前会话状态提示参与者下一步操作。
- 增加 `Scenario Preview`，在建会话前就解释场景和条件。
- 输出区增加 `response_source / model / fallback` 元信息。
- 任务运行改为随界面语言返回中英输出。

## 第二轮建议

### 1. 拆成四步主流程

- Step 1: `Create Session`
- Step 2: `Read Evidence`
- Step 3: `Repair Memory`
- Step 4: `Run Coordination Tasks`

每一步只突出一个主要面板，其余区域默认收起或弱化。

### 2. 给 transcript 和 memory 建立联动

- 点击 memory item 时高亮相关 transcript 片段
- 点击 proposed update 时显示它影响的 memory item
- 在 output 中点击 `usage_trace` 可以反查使用过的 memory

### 3. 降低编辑成本

- 把 inline edit 改成抽屉式编辑器
- 默认只显示摘要字段，展开后再显示 `entity_ref / depends_on / value`
- 新增“快速接受全部低风险更新”和“全部标记待确认”

### 4. 加研究者模式

- 参与者模式只保留必要操作
- 研究者模式才显示 `export`, raw ids, event counts, config details

### 5. 加前测/后测问卷页

- 在完成 tasks 后自然进入 reflection
- 避免参与者在主工作区里被过多系统信息打断

## 建议的后续实现顺序

1. transcript-memory-output 联动
2. 参与者/研究者双视图
3. 后测问卷和主持人视图
4. 更细的操作提示和空状态文案
