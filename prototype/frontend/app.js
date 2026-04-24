const state = {
  session: null,
  scenarios: [],
  conditions: [],
  outputs: [],
  conflictApplied: false,
  exportStatus: "",
  appConfig: null,
  language:
    localStorage.getItem("mmg_language") ||
    ((navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en")
};

const translations = {
  en: {
    page_title: "Meeting Memory Governance Prototype",
    hero_eyebrow: "CSCW Research Prototype",
    hero_title: "Meeting Memory Governance Lab",
    hero_subhead:
      "A research app for studying how people inspect, repair, and govern AI work memory with a real or controlled responder.",
    participant_id: "Participant ID",
    scenario: "Scenario",
    condition: "Condition",
    create_session: "Create Session",
    session: "Session",
    no_session: "No session created yet.",
    apply_conflict: "Apply Conflict",
    export_json: "Export JSON",
    export_csv: "Export CSV",
    save_export_files: "Save Export Files",
    workflow: "Workflow",
    task_brief: "What You Will Do",
    system_status: "System Status",
    transcript: "Transcript",
    transcript_empty: "Create a session to load transcript segments.",
    active_memory: "Active Memory",
    add_memory_item: "Add Memory Item",
    type: "Type",
    entity_ref: "Entity Ref",
    value: "Value",
    status_label: "Status",
    depends_on: "Depends On",
    content: "Content",
    add_memory: "Add Memory",
    memory_empty: "Memory visibility depends on condition.",
    proposed_updates: "Proposed Updates",
    updates_empty: "No proposed updates.",
    tasks: "Tasks",
    tasks_empty: "Create a session to run tasks.",
    outputs: "Outputs",
    outputs_empty: "Task responses will appear here.",
    conflict_notice: "Current Conflict",
    conflict_notice_empty: "No injected conflict yet. Read the transcript and build a mental model first.",
    workflow_1_title: "1. Read the meeting evidence",
    workflow_1_body: "Review the transcript and understand what the assistant currently believes about tasks, owners, and constraints.",
    workflow_2_title: "2. Repair the assistant's memory",
    workflow_2_body: "After applying the conflict, accept or edit updates and mark uncertain items instead of leaving hidden inconsistencies.",
    workflow_3_title: "3. Run downstream coordination tasks",
    workflow_3_body: "Use the repaired memory to replan work, inspect risks, and audit whether proposed actions still match the meeting.",
    task_brief_1_title: "Build a system mental model",
    task_brief_1_body: "Read the transcript, compare it with active memory, and identify what the assistant currently believes.",
    task_brief_2_title: "Repair the working state",
    task_brief_2_body: "When conflict appears, decide whether to accept, edit, reject, or mark uncertain memory items.",
    task_brief_3_title: "Evaluate downstream decisions",
    task_brief_3_body: "Run replan, risk, and audit tasks to see how repaired memory changes the assistant's coordination output.",
    scenario_note_prefix: "Scenario focus: ",
    condition_note_prefix: "Condition behavior: ",
    condition_note_hidden:
      "Participants cannot inspect or edit memory and must rely on the assistant's black-box state.",
    condition_note_visible_readonly:
      "Participants can inspect memory, provenance, and conflicts but cannot directly repair them.",
    condition_note_visible_editable:
      "Participants can inspect, edit, add, delete, and mark memory items as uncertain.",
    preview_prefix: "Selected setup: ",
    preview_joiner: " | ",
    session_id: "Session ID",
    step: "Step",
    event_count: "Event Count",
    unknown_role: "Unknown role",
    no_entity: "no-entity",
    source: "source",
    save: "Save",
    run_task: "Run Task",
    mark_uncertain: "Mark Uncertain",
    delete: "Delete",
    accept: "Accept",
    reject: "Reject",
    new_item: "new item",
    target: "target",
    usage_trace: "usage trace",
    task_kind_replan: "replan",
    task_kind_risk_analysis: "risk_analysis",
    task_kind_decision_audit: "decision_audit",
    update_action_add: "add",
    update_action_update: "update",
    update_action_remove: "remove",
    saved_export_prefix: "Saved export files to ",
    condition_hidden: "Hidden",
    condition_visible_readonly: "Visible-Readonly",
    condition_visible_editable: "Visible-Editable",
    type_task: "task",
    type_owner: "owner",
    type_deadline: "deadline",
    type_dependency: "dependency",
    type_constraint: "constraint",
    type_open_issue: "open_issue",
    status_active: "active",
    status_uncertain: "uncertain",
    status_resolved: "resolved",
    status_removed: "removed",
    scenario_launch: "Product Launch Coordination",
    scenario_research: "Research Pilot Coordination",
    scenario_outage: "Incident Response Coordination",
    scenario_launch_note:
      "A cross-functional team is coordinating a launch with legal review, bug closure, and announcement timing dependencies.",
    scenario_research_note:
      "A research team is coordinating pilot preparation under ethics approval, recruitment planning, and budget uncertainty.",
    scenario_outage_note:
      "An incident response team is coordinating hotfix work, QA signoff, traffic restoration, and external communication.",
    responder_requested_mode: "Requested mode",
    responder_effective_mode: "Effective mode",
    responder_model: "Model",
    responder_openai_ready: "OpenAI key",
    responder_status: "Status",
    responder_status_ready: "ready",
    responder_status_fallback: "fallback",
    responder_status_misconfigured: "misconfigured",
    responder_mode_auto: "auto",
    responder_mode_deterministic: "deterministic",
    responder_mode_openai: "openai",
    responder_mode_openai_unavailable: "openai unavailable",
    responder_openai_yes: "configured",
    responder_openai_no: "missing",
    next_step: "Recommended Next Step",
    next_step_create: "Create a session, then read the transcript before touching memory.",
    next_step_apply_conflict: "Read the transcript and active memory, then apply the conflict to reveal the repair task.",
    next_step_repair: "Review proposed updates and repair the assistant's active memory before asking downstream tasks.",
    next_step_run_tasks: "Run all downstream tasks and compare how the assistant now reasons from the repaired memory.",
    next_step_export: "Save the session export so the study trace and event log are preserved for analysis.",
    hero_chip_live: "GPT-4.1 available",
    hero_chip_fallback: "Controlled fallback available",
    hero_chip_bilingual: "Bilingual interface",
    output_source: "Source",
    output_model: "Model",
    output_fallback: "Fallback",
    output_tokens: "Tokens",
    yes: "yes",
    no: "no"
  },
  zh: {
    page_title: "会议记忆治理研究原型",
    hero_eyebrow: "CSCW 研究原型",
    hero_title: "会议记忆治理实验台",
    hero_subhead: "这是一个研究原型，用于观察用户如何在真实或受控 responder 下检查、修复和治理 AI 的工作记忆。",
    participant_id: "参与者 ID",
    scenario: "场景",
    condition: "条件",
    create_session: "创建会话",
    session: "会话",
    no_session: "尚未创建会话。",
    apply_conflict: "注入冲突",
    export_json: "导出 JSON",
    export_csv: "导出 CSV",
    save_export_files: "保存导出文件",
    workflow: "实验流程",
    task_brief: "你将完成什么",
    system_status: "系统状态",
    transcript: "会议记录",
    transcript_empty: "请先创建会话以加载 transcript。",
    active_memory: "当前生效记忆",
    add_memory_item: "新增记忆条目",
    type: "类型",
    entity_ref: "实体引用",
    value: "值",
    status_label: "状态",
    depends_on: "依赖于",
    content: "内容",
    add_memory: "新增记忆",
    memory_empty: "是否可见取决于当前条件。",
    proposed_updates: "候选更新",
    updates_empty: "当前没有候选更新。",
    tasks: "任务",
    tasks_empty: "请先创建会话再运行任务。",
    outputs: "输出",
    outputs_empty: "任务输出会显示在这里。",
    conflict_notice: "当前冲突",
    conflict_notice_empty: "尚未注入冲突。建议先阅读 transcript，建立对系统状态的理解。",
    workflow_1_title: "1. 阅读会议证据",
    workflow_1_body: "先阅读 transcript，理解当前任务、负责人、约束和待决事项。",
    workflow_2_title: "2. 修复助手记忆",
    workflow_2_body: "注入冲突后，接受或编辑候选更新，并把不确定事项明确标记出来。",
    workflow_3_title: "3. 执行下游协调任务",
    workflow_3_body: "在修复后的记忆基础上完成重规划、风险分析和一致性审计。",
    task_brief_1_title: "建立系统心智模型",
    task_brief_1_body: "先阅读 transcript，再对照当前记忆，理解助手现在到底记住了什么。",
    task_brief_2_title: "修复工作状态",
    task_brief_2_body: "冲突出现后，你需要决定接受、编辑、拒绝，还是将记忆标成不确定。",
    task_brief_3_title: "评估下游决策",
    task_brief_3_body: "运行重规划、风险分析和一致性审计，观察修复后的记忆如何影响助手输出。",
    scenario_note_prefix: "场景重点：",
    condition_note_prefix: "条件特性：",
    condition_note_hidden: "参与者无法查看或编辑记忆，只能依赖助手的黑箱状态。",
    condition_note_visible_readonly: "参与者可以查看记忆、来源和冲突，但不能直接修复。",
    condition_note_visible_editable: "参与者可以查看、编辑、新增、删除记忆，并可标记不确定。",
    preview_prefix: "当前设置：",
    preview_joiner: "｜",
    session_id: "会话 ID",
    step: "步骤",
    event_count: "事件数",
    unknown_role: "未知角色",
    no_entity: "无实体",
    source: "来源",
    save: "保存",
    run_task: "运行任务",
    mark_uncertain: "标为不确定",
    delete: "删除",
    accept: "接受",
    reject: "拒绝",
    new_item: "新条目",
    target: "目标",
    usage_trace: "使用轨迹",
    task_kind_replan: "重规划",
    task_kind_risk_analysis: "风险分析",
    task_kind_decision_audit: "一致性审计",
    update_action_add: "新增",
    update_action_update: "更新",
    update_action_remove: "移除",
    saved_export_prefix: "导出文件已保存到 ",
    condition_hidden: "隐藏记忆",
    condition_visible_readonly: "可见只读",
    condition_visible_editable: "可见可编辑",
    type_task: "任务",
    type_owner: "负责人",
    type_deadline: "截止时间",
    type_dependency: "依赖关系",
    type_constraint: "约束",
    type_open_issue: "待决问题",
    status_active: "生效中",
    status_uncertain: "不确定",
    status_resolved: "已解决",
    status_removed: "已移除",
    scenario_launch: "产品发布协调",
    scenario_research: "研究试点推进",
    scenario_outage: "线上故障处置",
    scenario_launch_note: "一个跨部门团队正在协调产品发布，关键点包括法务审批、bug 关闭和公告时序。",
    scenario_research_note: "一个研究团队正在推进 pilot，核心约束包括伦理审批、招募安排和预算未决。",
    scenario_outage_note: "一个故障响应团队正在协调 hotfix、QA 签字、流量恢复和对外沟通。",
    responder_requested_mode: "请求模式",
    responder_effective_mode: "实际模式",
    responder_model: "模型",
    responder_openai_ready: "OpenAI 密钥",
    responder_status: "状态",
    responder_status_ready: "可用",
    responder_status_fallback: "回退中",
    responder_status_misconfigured: "配置错误",
    responder_mode_auto: "自动",
    responder_mode_deterministic: "规则模式",
    responder_mode_openai: "OpenAI",
    responder_mode_openai_unavailable: "OpenAI 不可用",
    responder_openai_yes: "已配置",
    responder_openai_no: "缺失",
    next_step: "建议下一步",
    next_step_create: "先创建会话，然后先读 transcript，不要急着改记忆。",
    next_step_apply_conflict: "先读 transcript 和当前记忆，再注入冲突，进入修复任务。",
    next_step_repair: "先处理候选更新并修复 active memory，再去运行下游任务。",
    next_step_run_tasks: "把三个任务都跑完，比较修复后的记忆如何改变助手判断。",
    next_step_export: "保存导出文件，保留完整会话轨迹和事件日志用于后续分析。",
    hero_chip_live: "可接入 GPT-4.1",
    hero_chip_fallback: "可回退到受控模式",
    hero_chip_bilingual: "中英双语界面",
    output_source: "来源",
    output_model: "模型",
    output_fallback: "是否回退",
    output_tokens: "Tokens",
    yes: "是",
    no: "否"
  }
};

function t(key) {
  return translations[state.language][key] || translations.en[key] || key;
}

function getConditionLabel(condition) {
  if (condition === "Hidden") return t("condition_hidden");
  if (condition === "Visible-Readonly") return t("condition_visible_readonly");
  if (condition === "Visible-Editable") return t("condition_visible_editable");
  return condition;
}

function getScenarioLabel(item) {
  return t(`scenario_${item.id}`) || item.title;
}

function getMemoryTypeLabel(type) {
  return t(`type_${type}`);
}

function getStatusLabel(status) {
  return t(`status_${status}`);
}

function getTaskKindLabel(kind) {
  return t(`task_kind_${kind}`);
}

function getUpdateActionLabel(action) {
  return t(`update_action_${action}`);
}

function getScenarioNote(scenarioId) {
  return t(`scenario_${scenarioId}_note`);
}

function getConditionNote(condition) {
  if (condition === "Hidden") return t("condition_note_hidden");
  if (condition === "Visible-Readonly") return t("condition_note_visible_readonly");
  if (condition === "Visible-Editable") return t("condition_note_visible_editable");
  return condition;
}

function getResponderModeLabel(mode) {
  return t(`responder_mode_${mode}`);
}

function getResponderStatusLabel(status) {
  return t(`responder_status_${status}`);
}

function localizedRole(item) {
  return state.language === "zh" ? item.role_zh || item.role || t("unknown_role") : item.role || t("unknown_role");
}

function localizedTranscriptText(item) {
  return state.language === "zh" ? item.text_zh || item.text : item.text;
}

function localizedTaskTitle(task) {
  return state.language === "zh" ? task.title_zh || task.title : task.title;
}

function localizedTaskPrompt(task) {
  return state.language === "zh" ? task.prompt_zh || task.prompt : task.prompt;
}

function localizedConflictLabel(conflict) {
  return state.language === "zh" ? conflict.label_zh || conflict.label : conflict.label;
}

function localizedConflictPrompt(conflict) {
  return state.language === "zh" ? conflict.prompt_zh || conflict.prompt : conflict.prompt;
}

function localizedUpdateReason(update) {
  return state.language === "zh" ? update.reason_zh || update.reason : update.reason;
}

const basePath = (() => {
  const pathname = window.location.pathname;
  if (pathname.endsWith("/index.html")) return pathname.slice(0, -"index.html".length);
  if (pathname.endsWith("/")) return pathname;
  return `${pathname}/`;
})();

function withBasePath(relativePath) {
  const clean = relativePath.startsWith("./") ? relativePath.slice(2) : relativePath.replace(/^\//, "");
  return `${basePath}${clean}`;
}

const refs = {
  form: document.querySelector("#session-form"),
  participantId: document.querySelector("#participant-id"),
  scenarioSelect: document.querySelector("#scenario-select"),
  conditionSelect: document.querySelector("#condition-select"),
  summary: document.querySelector("#session-summary"),
  transcriptList: document.querySelector("#transcript-list"),
  memoryList: document.querySelector("#memory-list"),
  updatesList: document.querySelector("#updates-list"),
  tasksList: document.querySelector("#tasks-list"),
  outputsList: document.querySelector("#outputs-list"),
  applyConflictBtn: document.querySelector("#apply-conflict-btn"),
  exportJsonBtn: document.querySelector("#export-json-btn"),
  exportCsvBtn: document.querySelector("#export-csv-btn"),
  saveExportBtn: document.querySelector("#save-export-btn"),
  exportStatus: document.querySelector("#export-status"),
  addMemoryForm: document.querySelector("#add-memory-form"),
  langButtons: [...document.querySelectorAll(".lang-btn")],
  workflowList: document.querySelector("#workflow-list"),
  contextNote: document.querySelector("#context-note"),
  conflictBanner: document.querySelector("#conflict-banner"),
  taskBrief: document.querySelector("#task-brief"),
  engineSummary: document.querySelector("#engine-summary"),
  nextStepCard: document.querySelector("#next-step-card"),
  setupPreview: document.querySelector("#setup-preview"),
  heroChips: document.querySelector("#hero-chips")
};

async function request(path, options = {}) {
  const response = await fetch(withBasePath(path), {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) return response.json();
  return response.text();
}

function setText(el, text) {
  el.textContent = text;
}

function renderOptions(select, items, getLabel) {
  select.innerHTML = "";
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id || item;
    option.textContent = getLabel(item);
    select.appendChild(option);
  });
}

function applyStaticTranslations() {
  document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
  document.title = t("page_title");

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  refs.langButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === state.language);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function renderHeroChips() {
  const responder = state.appConfig?.responder;
  const chips = [
    `<span class="pill">${t("hero_chip_bilingual")}</span>`,
    `<span class="pill">${responder?.effective_mode === "openai" ? t("hero_chip_live") : t("hero_chip_fallback")}</span>`
  ];
  refs.heroChips.innerHTML = chips.join("");
}

function renderSetupPreview() {
  const scenarioId = refs.scenarioSelect.value || state.scenarios[0]?.id;
  const condition = refs.conditionSelect.value || state.conditions[0];
  const scenarioNote = scenarioId ? getScenarioNote(scenarioId) : "";
  const conditionNote = condition ? getConditionNote(condition) : "";

  refs.setupPreview.className = "form-note";
  refs.setupPreview.innerHTML = `
    <strong>${t("preview_prefix")}</strong>
    ${getScenarioLabel({ id: scenarioId, title: scenarioId })}${t("preview_joiner")}${getConditionLabel(condition)}<br />
    ${scenarioNote}<br />
    ${conditionNote}
  `;
}

function getWorkflowStage() {
  if (!state.session || !state.conflictApplied) return 1;
  if (state.session.proposed_updates?.length) return 2;
  return 3;
}

function getNextStepCopy() {
  if (!state.session) return t("next_step_create");
  if (!state.conflictApplied && !state.session.current_conflict_round) return t("next_step_apply_conflict");
  if (state.session.proposed_updates?.length) return t("next_step_repair");
  if (state.outputs.length < (state.session.tasks?.length || 0)) return t("next_step_run_tasks");
  return t("next_step_export");
}

function renderTaskBrief() {
  refs.taskBrief.className = "stack";
  refs.taskBrief.innerHTML = `
    <article class="card brief-card">
      <strong>${t("task_brief_1_title")}</strong>
      <p>${t("task_brief_1_body")}</p>
    </article>
    <article class="card brief-card">
      <strong>${t("task_brief_2_title")}</strong>
      <p>${t("task_brief_2_body")}</p>
    </article>
    <article class="card brief-card">
      <strong>${t("task_brief_3_title")}</strong>
      <p>${t("task_brief_3_body")}</p>
    </article>
  `;
}

function renderEngineSummary() {
  const responder = state.appConfig?.responder;
  if (!responder) {
    refs.engineSummary.className = "kv-list empty";
    setText(refs.engineSummary, "...");
    refs.nextStepCard.className = "callout";
    refs.nextStepCard.innerHTML = `<strong>${t("next_step")}</strong><p>${getNextStepCopy()}</p>`;
    return;
  }

  refs.engineSummary.className = "kv-list";
  refs.engineSummary.innerHTML = `
    <div class="kv"><span>${t("responder_requested_mode")}</span><strong>${getResponderModeLabel(
      responder.requested_mode
    )}</strong></div>
    <div class="kv"><span>${t("responder_effective_mode")}</span><strong>${getResponderModeLabel(
      responder.effective_mode
    )}</strong></div>
    <div class="kv"><span>${t("responder_model")}</span><strong>${responder.model}</strong></div>
    <div class="kv"><span>${t("responder_openai_ready")}</span><strong>${
      responder.openai_ready ? t("responder_openai_yes") : t("responder_openai_no")
    }</strong></div>
    <div class="kv"><span>${t("responder_status")}</span><strong>${getResponderStatusLabel(responder.status)}</strong></div>
  `;

  refs.nextStepCard.className = "callout";
  refs.nextStepCard.innerHTML = `<strong>${t("next_step")}</strong><p>${getNextStepCopy()}</p>`;
}

function renderSummary() {
  if (!state.session) {
    refs.summary.className = "kv-list empty";
    setText(refs.summary, t("no_session"));
    refs.applyConflictBtn.disabled = true;
    refs.exportJsonBtn.disabled = true;
    refs.exportCsvBtn.disabled = true;
    refs.saveExportBtn.disabled = true;
    refs.exportStatus.textContent = state.exportStatus;
    refs.contextNote.className = "context-note empty";
    refs.contextNote.textContent = "";
    return;
  }

  refs.summary.className = "kv-list";
  refs.summary.innerHTML = `
    <div class="kv"><span>${t("session_id")}</span><strong>${state.session.session_id}</strong></div>
    <div class="kv"><span>${t("condition")}</span><strong>${getConditionLabel(state.session.condition)}</strong></div>
    <div class="kv"><span>${t("scenario")}</span><strong>${t(`scenario_${state.session.scenario_id}`)}</strong></div>
    <div class="kv"><span>${t("step")}</span><strong>${state.session.step}</strong></div>
    <div class="kv"><span>${t("event_count")}</span><strong>${state.session.event_log_count}</strong></div>
  `;

  refs.applyConflictBtn.disabled = state.conflictApplied;
  refs.exportJsonBtn.disabled = false;
  refs.exportCsvBtn.disabled = false;
  refs.saveExportBtn.disabled = false;
  refs.exportStatus.textContent = state.exportStatus;
  refs.contextNote.className = "context-note";
  refs.contextNote.innerHTML = `
    <strong>${t("scenario_note_prefix")}</strong> ${getScenarioNote(state.session.scenario_id)}<br />
    <strong>${t("condition_note_prefix")}</strong> ${getConditionNote(state.session.condition)}
  `;
}

function renderWorkflow() {
  const stage = getWorkflowStage();
  refs.workflowList.className = "stack workflow-stack";
  refs.workflowList.innerHTML = `
    <article class="card workflow-item ${stage === 1 ? "active" : stage > 1 ? "done" : ""}">
      <strong>${t("workflow_1_title")}</strong>
      <p>${t("workflow_1_body")}</p>
    </article>
    <article class="card workflow-item ${stage === 2 ? "active" : stage > 2 ? "done" : ""}">
      <strong>${t("workflow_2_title")}</strong>
      <p>${t("workflow_2_body")}</p>
    </article>
    <article class="card workflow-item ${stage === 3 ? "active" : ""}">
      <strong>${t("workflow_3_title")}</strong>
      <p>${t("workflow_3_body")}</p>
    </article>
  `;
}

function renderTranscript() {
  const items = state.session?.transcript || [];
  if (!items.length) {
    refs.transcriptList.className = "stack empty";
    setText(refs.transcriptList, t("transcript_empty"));
    return;
  }

  refs.transcriptList.className = "stack";
  refs.transcriptList.innerHTML = items
    .map(
      (item) => `
        <article class="card">
          <h3>${item.speaker}</h3>
          <p class="meta">${localizedRole(item)} · ${item.id}</p>
          <p>${localizedTranscriptText(item)}</p>
        </article>
      `
    )
    .join("");
}

function renderMemory() {
  const items = state.session?.active_memory || [];
  const canEdit = Boolean(state.session?.permissions?.canEditMemory);

  refs.addMemoryForm.style.display = canEdit ? "block" : "none";

  if (!items.length) {
    refs.memoryList.className = "stack empty";
    setText(refs.memoryList, t("memory_empty"));
    return;
  }

  refs.memoryList.className = "stack";
  refs.memoryList.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div><span class="pill">${getMemoryTypeLabel(item.type)}</span><span class="pill ${
        item.status !== "active" ? "warn" : ""
      }">${getStatusLabel(item.status)}</span></div>
      <h3>${item.content}</h3>
      <p class="meta">${item.id} · ${item.entity_ref || t("no_entity")} · ${t("value")}=${item.value ?? "n/a"}</p>
      <p class="meta">${t("source")}: ${(item.source_ref || []).join(", ")}</p>
      ${
        canEdit
          ? `
            <form class="inline-edit" data-memory-form="${item.id}">
              <label>
                ${t("content")}
                <input name="content" value="${escapeHtml(item.content || "")}" />
              </label>
              <label>
                ${t("value")}
                <input name="value" value="${escapeHtml(item.value ?? "")}" />
              </label>
              <label>
                ${t("status_label")}
                <select name="status">
                  ${["active", "uncertain", "resolved", "removed"]
                    .map(
                      (status) =>
                        `<option value="${status}" ${item.status === status ? "selected" : ""}>${getStatusLabel(
                          status
                        )}</option>`
                    )
                    .join("")}
                </select>
              </label>
              <label>
                ${t("entity_ref")}
                <input name="entity_ref" value="${escapeHtml(item.entity_ref || "")}" />
              </label>
              <label>
                ${t("depends_on")}
                <input name="depends_on" value="${escapeHtml(item.depends_on || "")}" />
              </label>
              <div class="memory-actions">
                <button type="submit">${t("save")}</button>
                <button type="button" class="secondary" data-uncertain="${item.id}">${t("mark_uncertain")}</button>
                <button type="button" class="secondary" data-delete="${item.id}">${t("delete")}</button>
              </div>
            </form>
          `
          : ""
      }
    `;
    refs.memoryList.appendChild(card);
  });

  refs.memoryList.querySelectorAll("[data-memory-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const memoryId = form.dataset.memoryForm;
      await patchMemory(memoryId, {
        content: formData.get("content"),
        value: formData.get("value"),
        status: formData.get("status"),
        entity_ref: formData.get("entity_ref"),
        depends_on: formData.get("depends_on")
      });
    });
  });

  refs.memoryList.querySelectorAll("[data-uncertain]").forEach((button) => {
    button.addEventListener("click", () => markUncertain(button.dataset.uncertain));
  });

  refs.memoryList.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteMemory(button.dataset.delete));
  });
}

async function acceptUpdate(updateId) {
  const data = await request(`api/sessions/${state.session.session_id}/updates/${updateId}/accept`, {
    method: "POST"
  });
  state.session = data.session;
  renderAll();
}

async function rejectUpdate(updateId) {
  const data = await request(`api/sessions/${state.session.session_id}/updates/${updateId}/reject`, {
    method: "POST"
  });
  state.session = data.session;
  renderAll();
}

async function patchMemory(memoryId, payload) {
  const data = await request(`api/sessions/${state.session.session_id}/memory/${memoryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  state.session = data.session;
  renderAll();
}

async function markUncertain(memoryId) {
  const data = await request(`api/sessions/${state.session.session_id}/memory/${memoryId}/uncertain`, {
    method: "POST"
  });
  state.session = data.session;
  renderAll();
}

async function deleteMemory(memoryId) {
  const data = await request(`api/sessions/${state.session.session_id}/memory/${memoryId}/delete`, {
    method: "POST"
  });
  state.session = data.session;
  renderAll();
}

async function addMemory(event) {
  event.preventDefault();
  const formData = new FormData(refs.addMemoryForm);
  const payload = {
    type: formData.get("type"),
    content: formData.get("content"),
    entity_ref: formData.get("entity_ref"),
    value: formData.get("value"),
    depends_on: formData.get("depends_on"),
    status: "active"
  };

  const data = await request(`api/sessions/${state.session.session_id}/memory`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  refs.addMemoryForm.reset();
  state.session = data.session;
  renderAll();
}

function renderUpdates() {
  const items = state.session?.proposed_updates || [];
  const currentConflict = state.session?.current_conflict_round;

  if (currentConflict) {
    refs.conflictBanner.className = "conflict-banner";
    refs.conflictBanner.innerHTML = `
      <strong>${t("conflict_notice")} · ${localizedConflictLabel(currentConflict)}</strong>
      <p>${localizedConflictPrompt(currentConflict)}</p>
    `;
  } else {
    refs.conflictBanner.className = "conflict-banner empty";
    refs.conflictBanner.textContent = t("conflict_notice_empty");
  }

  if (!items.length) {
    refs.updatesList.className = "stack empty";
    setText(refs.updatesList, t("updates_empty"));
    return;
  }

  refs.updatesList.className = "stack";
  refs.updatesList.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div><span class="pill">${getUpdateActionLabel(item.action)}</span></div>
      <h3>${item.proposed_item.content}</h3>
      <p class="meta">${item.id} · ${t("target")}=${item.target_memory_id || t("new_item")}</p>
      <p>${localizedUpdateReason(item)}</p>
      <div class="update-actions">
        <button data-accept="${item.id}">${t("accept")}</button>
        <button class="secondary" data-reject="${item.id}">${t("reject")}</button>
      </div>
    `;
    refs.updatesList.appendChild(card);
  });

  refs.updatesList.querySelectorAll("[data-accept]").forEach((button) => {
    button.addEventListener("click", () => acceptUpdate(button.dataset.accept));
  });
  refs.updatesList.querySelectorAll("[data-reject]").forEach((button) => {
    button.addEventListener("click", () => rejectUpdate(button.dataset.reject));
  });
}

async function runTask(taskId) {
  const data = await request(`api/sessions/${state.session.session_id}/tasks/${taskId}/run`, {
    method: "POST",
    body: JSON.stringify({ language: state.language })
  });

  state.session = data.session;
  const response = data.response;
  state.outputs = [...state.outputs.filter((item) => item.task_id !== response.task_id), response];
  renderAll();
}

function renderTasks() {
  const items = state.session?.tasks || [];
  if (!items.length) {
    refs.tasksList.className = "stack empty";
    setText(refs.tasksList, t("tasks_empty"));
    return;
  }

  refs.tasksList.className = "stack";
  refs.tasksList.innerHTML = "";
  items.forEach((task) => {
    const card = document.createElement("article");
    card.className = "card task-card";
    card.innerHTML = `
      <div><span class="pill">${getTaskKindLabel(task.kind)}</span></div>
      <h3>${localizedTaskTitle(task)}</h3>
      <p>${localizedTaskPrompt(task)}</p>
      <div class="task-actions">
        <button data-run="${task.id}">${t("run_task")}</button>
      </div>
    `;
    refs.tasksList.appendChild(card);
  });

  refs.tasksList.querySelectorAll("[data-run]").forEach((button) => {
    button.addEventListener("click", () => runTask(button.dataset.run));
  });
}

function renderOutputs() {
  if (!state.outputs.length) {
    refs.outputsList.className = "stack empty";
    setText(refs.outputsList, t("outputs_empty"));
    return;
  }

  refs.outputsList.className = "stack";
  refs.outputsList.innerHTML = state.outputs
    .map((response) => {
      const tokens = response.raw_usage?.total_tokens ?? "n/a";
      return `
        <article class="card response-card">
          <div class="response-topline">
            <span class="pill">${getTaskKindLabel(response.task_kind)}</span>
            <span class="pill ${response.fallback_used ? "warn" : ""}">${t("output_source")}: ${
              response.response_source || "deterministic"
            }</span>
          </div>
          <h4>${escapeHtml(response.summary)}</h4>
          <ul>${(response.bullets || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <p class="meta">${t("usage_trace")}: ${(response.usage_trace || []).join(", ") || "n/a"}</p>
          <p class="meta">${t("output_model")}: ${escapeHtml(response.model || "deterministic-v1")} · ${
            t("output_fallback")
          }: ${response.fallback_used ? t("yes") : t("no")} · ${t("output_tokens")}: ${tokens}</p>
        </article>
      `;
    })
    .join("");
}

function renderAll() {
  applyStaticTranslations();
  renderHeroChips();
  renderSetupPreview();
  renderTaskBrief();
  renderEngineSummary();
  renderSummary();
  renderWorkflow();
  renderTranscript();
  renderMemory();
  renderUpdates();
  renderTasks();
  renderOutputs();
}

async function createSession(event) {
  event.preventDefault();
  const payload = {
    participantId: refs.participantId.value.trim(),
    scenarioId: refs.scenarioSelect.value,
    condition: refs.conditionSelect.value
  };

  const data = await request("api/sessions", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  state.session = data.session;
  state.outputs = [];
  state.conflictApplied = false;
  state.exportStatus = "";
  renderAll();
}

async function applyConflict() {
  const data = await request(`api/sessions/${state.session.session_id}/conflicts/round_1`, {
    method: "POST"
  });
  state.session = data.session;
  state.conflictApplied = true;
  renderAll();
}

function exportSession(kind) {
  window.open(withBasePath(`api/sessions/${state.session.session_id}/export/${kind}`), "_blank");
}

async function saveExportFiles() {
  const data = await request(`api/sessions/${state.session.session_id}/export/save`, {
    method: "POST"
  });
  state.exportStatus = `${t("saved_export_prefix")}${data.saved.directory}`;
  renderSummary();
}

function setLanguage(language) {
  const currentScenario = refs.scenarioSelect.value;
  const currentCondition = refs.conditionSelect.value;
  state.language = language;
  localStorage.setItem("mmg_language", language);
  renderOptions(refs.scenarioSelect, state.scenarios, (item) => getScenarioLabel(item));
  renderOptions(refs.conditionSelect, state.conditions, (item) => getConditionLabel(item));
  refs.scenarioSelect.value = currentScenario;
  refs.conditionSelect.value = currentCondition;
  renderAll();
}

async function init() {
  const data = await request("api/scenarios");
  state.scenarios = data.scenarios;
  state.conditions = data.conditions;
  state.appConfig = data.app_config || null;
  renderOptions(refs.scenarioSelect, state.scenarios, (item) => getScenarioLabel(item));
  renderOptions(refs.conditionSelect, state.conditions, (item) => getConditionLabel(item));

  refs.form.addEventListener("submit", createSession);
  refs.applyConflictBtn.addEventListener("click", applyConflict);
  refs.exportJsonBtn.addEventListener("click", () => exportSession("json"));
  refs.exportCsvBtn.addEventListener("click", () => exportSession("csv"));
  refs.saveExportBtn.addEventListener("click", saveExportFiles);
  refs.addMemoryForm.addEventListener("submit", addMemory);
  refs.scenarioSelect.addEventListener("change", renderSetupPreview);
  refs.conditionSelect.addEventListener("change", renderSetupPreview);
  refs.langButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  renderAll();
}

init().catch((error) => {
  refs.summary.className = "kv-list empty";
  refs.summary.textContent = error.message;
});
