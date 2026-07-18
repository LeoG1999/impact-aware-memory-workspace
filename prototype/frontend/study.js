const MEMORIES = [
  { id: "travel_with_child", label: "同行者", value: "with_child", origin: "2025 年大阪旅行", provenance: "历史对话", options: [{ value: "with_child", label: "这次与孩子同行" }, { value: "solo", label: "这次独自出行" }] },
  { id: "mobility", label: "步行强度", value: "low_walking", origin: "近期健康偏好", provenance: "用户确认", options: [{ value: "low_walking", label: "低步行强度" }, { value: "moderate_walking", label: "可接受中等步行" }, { value: "no_limit", label: "不限制步行" }] },
  { id: "hotel_priority", label: "住宿位置", value: "central", origin: "最近两次旅行", provenance: "行为推断", options: [{ value: "central", label: "优先市中心" }, { value: "traditional", label: "优先传统住宿" }, { value: "value", label: "优先性价比" }] },
  { id: "pace", label: "行程节奏", value: "relaxed", origin: "历史行程密度", provenance: "系统推断", options: [{ value: "relaxed", label: "轻松：2 至 3 项" }, { value: "balanced", label: "均衡：3 至 4 项" }, { value: "packed", label: "紧凑：4 项以上" }] },
  { id: "interests", label: "主要兴趣", value: "local_culture", origin: "收藏和明确表达", provenance: "用户确认", options: [{ value: "local_culture", label: "当地文化与手工艺" }, { value: "nature", label: "自然景观" }, { value: "food", label: "饮食体验" }] },
  { id: "diet", label: "饮食限制", value: "vegetarian", origin: "个人饮食设置", provenance: "用户确认", options: [{ value: "vegetarian", label: "素食" }, { value: "none", label: "无饮食限制" }] },
  { id: "start_time", label: "开始时间", value: "avoid_early", origin: "多次拒绝早班安排", provenance: "行为推断", options: [{ value: "avoid_early", label: "避免早于 8:30" }, { value: "early_ok", label: "可以早起" }] },
  { id: "budget", label: "当地预算", value: "700", origin: "当前旅行预算", provenance: "用户确认", options: [{ value: "550", label: "约 550 美元" }, { value: "700", label: "约 700 美元" }, { value: "900", label: "约 900 美元" }] }
];

const REQUEST = "请安排 3 天京都行程，不要太赶，预算约 700 美元，不包含国际机票。";
const STEPS = ["初始判断", "定位问题", "预演修改", "最终判断", "结果"];

const el = {
  api: document.querySelector("#studyApiStatus"),
  progress: document.querySelector("#studyProgress"),
  memoryList: document.querySelector("#studyMemoryList"),
  memoryVisibility: document.querySelector("#memoryVisibility"),
  plan: document.querySelector("#studyPlan"),
  planTitle: document.querySelector("#itineraryTitle"),
  viewToggle: document.querySelector("#planViewToggle"),
  task: document.querySelector("#taskSurface"),
  stepNumber: document.querySelector("#stepNumber"),
  elapsed: document.querySelector("#elapsedTime"),
  toast: document.querySelector("#studyToast")
};

const state = {
  phase: 0,
  memories: structuredClone(MEMORIES),
  basePlan: null,
  previewPlan: null,
  planView: "base",
  loading: false,
  error: null,
  apiReady: false,
  model: "DeepSeek",
  startedAt: null,
  phaseStartedAt: null,
  selectedMemoryId: null,
  sandboxValue: null,
  initialDecision: null,
  initialConfidence: 70,
  diagnosisSource: null,
  diagnosisMemoryId: null,
  impact: null,
  applied: false,
  skippedRepair: false,
  finalDecision: null,
  finalConfidence: 70,
  completedAt: null,
  events: []
};

function esc(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function memoryById(id) { return state.memories.find((memory) => memory.id === id); }
function memoryLabel(memory, value = memory.value) { return memory?.options.find((option) => option.value === value)?.label || value; }
function memoryPayload(memories) { return memories.map(({ id, label, value, provenance, origin }) => ({ id, label, value, status: provenance, source: origin })); }
function log(action, details = {}) { state.events.push({ action, at_ms: state.startedAt ? Date.now() - state.startedAt : 0, phase: state.phase, ...details }); }

function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.toast.classList.remove("visible"), 2600);
}

async function checkApi() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    state.apiReady = Boolean(data.configured);
    state.model = data.model || "DeepSeek";
    el.api.className = `api-chip ${state.apiReady ? "ready" : "error"}`;
    el.api.innerHTML = `<i></i>${state.apiReady ? esc(state.model) : "API key missing"}`;
  } catch {
    el.api.className = "api-chip error";
    el.api.innerHTML = "<i></i>Server unavailable";
  }
  renderTask();
}

function setPhase(phase) {
  state.phase = phase;
  state.phaseStartedAt = Date.now();
  log("phase_entered", { value: phase });
  render();
}

function renderProgress() {
  el.progress.innerHTML = STEPS.map((step, index) => {
    const number = index + 1;
    const active = state.phase === number;
    const complete = state.phase > number;
    return `<span class="progress-step ${active ? "active" : ""} ${complete ? "complete" : ""}"><b>${complete ? "✓" : number}</b>${esc(step)}</span>`;
  }).join("");
}

function renderMemories() {
  if (state.phase < 2) {
    el.memoryVisibility.textContent = "初始判断后开放";
    el.memoryList.innerHTML = '<div class="memory-hidden">Memory 在初始判断阶段保持隐藏。</div>';
    return;
  }
  el.memoryVisibility.textContent = `${state.memories.length} 条`;
  el.memoryList.innerHTML = state.memories.map((memory) => `
    <button class="study-memory ${memory.id === state.selectedMemoryId ? "selected" : ""}" data-memory="${esc(memory.id)}" type="button" ${state.phase > 3 ? "disabled" : ""}>
      <span class="memory-row"><strong>${esc(memory.label)}</strong><span class="memory-origin">${esc(memory.origin)}</span></span>
      <p>${esc(memoryLabel(memory))}</p>
      <span class="memory-tag">${esc(memory.provenance)}</span>
    </button>`).join("");
  el.memoryList.querySelectorAll("[data-memory]").forEach((button) => button.addEventListener("click", () => {
    state.selectedMemoryId = button.dataset.memory;
    const memory = memoryById(state.selectedMemoryId);
    state.sandboxValue = memory.options.find((option) => option.value !== memory.value)?.value || memory.value;
    state.previewPlan = null;
    state.impact = null;
    state.planView = "base";
    log("memory_selected", { memory_id: state.selectedMemoryId });
    render();
  }));
}

function flatten(plan) {
  if (!plan) return [];
  const items = plan.lodging ? [plan.lodging] : [];
  for (const day of plan.days || []) for (const item of day.items || []) items.push({ ...item, day: day.day });
  return items;
}

function typeName(type) { return ({ hotel: "住宿", activity: "活动", meal: "餐饮", transit: "交通", rest: "休息" })[type] || "安排"; }

function renderDecision(item) {
  const changed = state.impact?.changes.some((change) => change.id === item.id) && state.planView === "preview";
  const memoryNames = (item.memory_ids || []).map((id) => memoryById(id)?.label || id).join("、");
  return `<article class="decision ${changed ? "changed" : ""}">
    <time>${esc(item.time)}</time><div>
      <div class="decision-head"><h4>${esc(item.title)}</h4><span class="decision-type">${esc(typeName(item.type))}</span></div>
      <p>${esc(item.description)}</p>
      <div class="decision-meta"><span>${esc(item.location)}</span><span>${Number(item.duration_minutes) || 0} 分钟</span><span>$${Number(item.cost) || 0}</span>${memoryNames ? `<span class="memory-link">Memory: ${esc(memoryNames)}</span>` : ""}</div>
    </div></article>`;
}

function renderPlan() {
  if (state.loading && !state.basePlan) {
    el.plan.innerHTML = '<div class="study-loading"><div><h3>DeepSeek 正在生成初始决策图</h3><p>同一份输出将用于初始判断和后续反事实基线。</p><div class="loading-track"></div></div></div>';
    return;
  }
  if (state.error && !state.basePlan) {
    el.plan.innerHTML = `<div class="study-error"><div><h3>行程生成失败</h3><p>${esc(state.error)}</p></div></div>`;
    return;
  }
  if (!state.basePlan) {
    el.plan.innerHTML = '<div class="empty-plan"><div><h3>Trial 尚未开始</h3><p>开始后，Agent 将使用请求和现有 persistent memory 生成一份固定的初始行程。</p></div></div>';
    return;
  }
  const plan = state.planView === "preview" && state.previewPlan ? state.previewPlan : state.basePlan;
  el.planTitle.textContent = state.planView === "preview" ? "Sandbox 预演方案" : "初始行程方案";
  el.viewToggle.hidden = !state.previewPlan;
  el.viewToggle.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.planView === state.planView));
  const lodging = plan.lodging ? `<section class="day-block"><div class="day-header"><span>BASE</span><h3>住宿基点</h3></div>${renderDecision(plan.lodging)}</section>` : "";
  el.plan.innerHTML = `
    <section class="plan-overview"><div><h3>${esc(plan.title)}</h3><p>${esc(plan.summary)}</p></div><div class="plan-cost"><strong>$${Number(plan.total_cost) || 0}</strong><span>预计总支出</span></div></section>
    <div class="day-stack">${lodging}${(plan.days || []).map((day) => `<section class="day-block"><div class="day-header"><span>DAY ${day.day}</span><h3>${esc(day.theme)}</h3></div>${(day.items || []).map(renderDecision).join("")}</section>`).join("")}</div>`;
}

function choiceButtons(name, choices, selected) {
  return `<div class="choice-grid">${choices.map(([value, label]) => `<button class="choice-button ${selected === value ? "selected" : ""}" data-choice-group="${name}" data-choice="${value}" type="button">${label}</button>`).join("")}</div>`;
}

function confidenceControl(value, id) {
  return `<label class="confidence-field"><span class="confidence-row"><b>判断信心</b><span id="${id}Value">${value}%</span></span><input id="${id}" type="range" min="0" max="100" step="5" value="${value}"></label>`;
}

function bindChoices(group, callback) {
  document.querySelectorAll(`[data-choice-group="${group}"]`).forEach((button) => button.addEventListener("click", () => { callback(button.dataset.choice); renderTask(); }));
}

function renderTask() {
  el.stepNumber.textContent = state.phase === 0 ? "准备" : state.phase <= 5 ? `Step ${state.phase} / 5` : "完成";
  if (state.phase === 0) {
    el.task.innerHTML = `<h2>开始当前 Trial</h2><p class="task-intro">初始行程生成后，计时和行为日志将开始。</p><div class="task-form"><button id="beginTrial" class="primary-action" type="button" ${!state.apiReady || state.loading ? "disabled" : ""}>${state.loading ? "正在生成…" : "生成行程并开始"}</button>${state.error ? `<p class="task-intro">${esc(state.error)}</p>` : ""}</div>`;
    document.querySelector("#beginTrial")?.addEventListener("click", beginTrial);
    return;
  }
  if (state.phase === 1) return renderInitialTask();
  if (state.phase === 2) return renderDiagnosisTask();
  if (state.phase === 3) return renderSandboxTask();
  if (state.phase === 4) return renderFinalTask();
  renderResults();
}

function renderInitialTask() {
  el.task.innerHTML = `<h2>你会接受这份初始行程吗？</h2><p class="task-intro">只根据当前事实和 Agent 输出做出第一判断。</p><div class="task-form">
    ${choiceButtons("initial", [["accept", "接受这份行程"], ["reject", "拒绝并要求调整"], ["unsure", "暂时无法判断"]], state.initialDecision)}
    ${confidenceControl(state.initialConfidence, "initialConfidence")}
    <button id="submitInitial" class="primary-action" type="button" ${!state.initialDecision ? "disabled" : ""}>提交初始判断</button>
  </div>`;
  bindChoices("initial", (value) => { state.initialDecision = value; });
  const slider = document.querySelector("#initialConfidence");
  slider.addEventListener("input", () => { state.initialConfidence = Number(slider.value); document.querySelector("#initialConfidenceValue").textContent = `${slider.value}%`; });
  document.querySelector("#submitInitial").addEventListener("click", () => { log("initial_decision", { decision: state.initialDecision, confidence: state.initialConfidence }); setPhase(2); });
}

function renderDiagnosisTask() {
  el.task.innerHTML = `<h2>问题最可能来自哪里？</h2><p class="task-intro">Memory 已开放。若选择 memory，请同时在左侧选中你认为有问题的条目。</p><div class="task-form">
    ${choiceButtons("diagnosis", [["memory", "Persistent memory"], ["planner", "Agent 规划或推理"], ["data", "目录或工具数据"], ["none", "没有明显问题"]], state.diagnosisSource)}
    <div class="selection-summary">${state.selectedMemoryId ? `当前选中：${esc(memoryById(state.selectedMemoryId).label)} · ${esc(memoryLabel(memoryById(state.selectedMemoryId)))}` : "尚未选择 memory 条目"}</div>
    <button id="submitDiagnosis" class="primary-action" type="button" ${!state.diagnosisSource || (state.diagnosisSource === "memory" && !state.selectedMemoryId) ? "disabled" : ""}>提交诊断</button>
  </div>`;
  bindChoices("diagnosis", (value) => { state.diagnosisSource = value; });
  document.querySelector("#submitDiagnosis").addEventListener("click", () => {
    state.diagnosisMemoryId = state.selectedMemoryId;
    const memory = memoryById(state.selectedMemoryId) || state.memories[0];
    state.sandboxValue = memory.options.find((option) => option.value !== memory.value)?.value || memory.value;
    log("diagnosis_submitted", { source: state.diagnosisSource, memory_id: state.diagnosisMemoryId });
    setPhase(3);
  });
}

function renderSandboxTask() {
  const memory = memoryById(state.selectedMemoryId);
  if (!memory) {
    el.task.innerHTML = `<h2>是否修改 Memory？</h2><p class="task-intro">你的诊断没有指向具体 memory，可以直接进入最终判断。</p><div class="task-form"><button id="skipRepair" class="secondary-action" type="button">不修改，继续</button></div>`;
    document.querySelector("#skipRepair").addEventListener("click", skipRepair);
    return;
  }
  const changed = state.sandboxValue !== memory.value;
  el.task.innerHTML = `<h2>预演一项 Memory 修改</h2><p class="task-intro">修改先进入 sandbox，不会立即覆盖持久记忆。</p><div class="task-form">
    <div class="selection-summary"><strong>${esc(memory.label)}</strong><br>当前：${esc(memoryLabel(memory))}</div>
    <label class="sandbox-field"><span class="label">Sandbox value</span><select id="studySandboxSelect">${memory.options.map((option) => `<option value="${esc(option.value)}" ${option.value === state.sandboxValue ? "selected" : ""}>${esc(option.label)}</option>`).join("")}</select></label>
    <button id="runPreview" class="primary-action" type="button" ${!changed || state.loading ? "disabled" : ""}>${state.loading ? "反事实重跑中…" : "运行 Impact Preview"}</button>
    ${state.impact ? renderImpact() : ""}
    ${state.impact ? `<div class="button-pair"><button id="discardImpact" class="danger-action" type="button">放弃修改</button><button id="applyImpact" class="primary-action" type="button">应用修改</button></div>` : `<button id="skipRepair" class="secondary-action" type="button">不修改，直接继续</button>`}
  </div>`;
  const select = document.querySelector("#studySandboxSelect");
  select.addEventListener("change", () => { state.sandboxValue = select.value; state.previewPlan = null; state.impact = null; state.planView = "base"; render(); });
  document.querySelector("#runPreview")?.addEventListener("click", runPreview);
  document.querySelector("#skipRepair")?.addEventListener("click", skipRepair);
  document.querySelector("#discardImpact")?.addEventListener("click", () => { log("impact_discarded", { memory_id: memory.id }); state.previewPlan = null; state.impact = null; state.planView = "base"; render(); });
  document.querySelector("#applyImpact")?.addEventListener("click", applyImpact);
}

function renderImpact() {
  const direct = state.impact.changes.filter((change) => change.kind === "direct");
  const cascade = state.impact.changes.filter((change) => change.kind === "cascade");
  const unattributed = state.impact.changes.filter((change) => change.kind === "unattributed");
  const items = [...direct.slice(0, 2), ...cascade.slice(0, 2), ...unattributed.slice(0, 1)];
  return `<section class="impact-panel"><div class="impact-head"><h3>Observed impact</h3><span>${state.impact.changes.length} 个节点变化</span></div>
    <div class="impact-stats"><div class="impact-stat"><strong>${direct.length}</strong><span>直接</span></div><div class="impact-stat"><strong>${cascade.length}</strong><span>连锁</span></div><div class="impact-stat"><strong>${unattributed.length}</strong><span>未归因</span></div></div>
    <div class="impact-list">${items.map((change) => `<div class="impact-item ${change.kind}"><strong>${esc(change.id)}</strong><p>${esc(changeText(change))}</p></div>`).join("")}</div>
  </section>`;
}

function renderFinalTask() {
  const planState = state.applied ? "你已应用 sandbox 修改。中央区域显示预演后的方案。" : "你没有修改 persistent memory。中央区域仍显示初始方案。";
  el.task.innerHTML = `<h2>现在你会接受这份行程吗？</h2><p class="task-intro">${planState}</p><div class="task-form">
    ${choiceButtons("final", [["accept", "接受当前行程"], ["reject", "拒绝当前行程"], ["unsure", "仍然无法判断"]], state.finalDecision)}
    ${confidenceControl(state.finalConfidence, "finalConfidence")}
    <button id="submitFinal" class="primary-action" type="button" ${!state.finalDecision ? "disabled" : ""}>完成 Trial</button>
  </div>`;
  bindChoices("final", (value) => { state.finalDecision = value; });
  const slider = document.querySelector("#finalConfidence");
  slider.addEventListener("input", () => { state.finalConfidence = Number(slider.value); document.querySelector("#finalConfidenceValue").textContent = `${slider.value}%`; });
  document.querySelector("#submitFinal").addEventListener("click", () => { state.completedAt = Date.now(); log("final_decision", { decision: state.finalDecision, confidence: state.finalConfidence }); setPhase(5); });
}

function renderResults() {
  const metrics = calculateMetrics();
  el.task.innerHTML = `<div class="result-banner"><strong>Trial 已完成</strong><p>以下是实验系统基于行为日志自动计算的结果。</p></div>
    <div class="result-list">
      ${resultRow("Causal diagnosis", metrics.diagnosis, metrics.diagnosis ? "正确定位到同行者 memory" : "未正确定位 failure source")}
      ${resultRow("Repair success", metrics.repair, metrics.repair ? "Memory 已修正为本次独自出行" : "目标 memory 未被正确修复")}
      ${resultRow("Initial reliance", metrics.initialReliance, metrics.initialReliance ? "初始接受行为与计划状态一致" : "初始接受行为与计划状态不一致")}
      ${resultRow("Final reliance", metrics.finalReliance, metrics.finalReliance ? "最终接受行为与修复后状态一致" : "最终接受行为仍不匹配")}
      <div class="result-row"><div class="result-head"><strong>Completion time</strong><span>${metrics.seconds}s</span></div><p>${state.events.length} 个交互事件已记录。</p></div>
    </div>
    <div class="task-form"><button id="exportTrial" class="primary-action" type="button">导出 Trial JSON</button><button id="restartTrial" class="secondary-action" type="button">重新开始</button></div>`;
  document.querySelector("#exportTrial").addEventListener("click", exportTrial);
  document.querySelector("#restartTrial").addEventListener("click", () => location.reload());
}

function resultRow(label, good, detail) { return `<div class="result-row"><div class="result-head"><strong>${label}</strong><span class="${good ? "metric-good" : "metric-bad"}">${good ? "PASS" : "MISS"}</span></div><p>${detail}</p></div>`; }

function attributedIds(plan, memoryId) { return new Set((plan?.memory_usage || []).find((entry) => entry.memory_id === memoryId)?.decisions || []); }
function fieldsChanged(a, b) { return ["title", "time", "location", "cost", "duration_minutes"].filter((field) => String(a?.[field] ?? "") !== String(b?.[field] ?? "")); }

function computeImpact(beforePlan, afterPlan, memoryId) {
  const before = new Map(flatten(beforePlan).map((item) => [item.id, item]));
  const after = new Map(flatten(afterPlan).map((item) => [item.id, item]));
  const directIds = new Set([...attributedIds(beforePlan, memoryId), ...attributedIds(afterPlan, memoryId)]);
  const changes = [];
  for (const id of new Set([...before.keys(), ...after.keys()])) {
    const a = before.get(id), b = after.get(id), fields = fieldsChanged(a, b);
    if (!a || !b || fields.length) {
      const grounded = [...(a?.memory_ids || []), ...(b?.memory_ids || [])].includes(memoryId) || directIds.has(id);
      changes.push({ id, before: a, after: b, fields, grounded });
      if (grounded) directIds.add(id);
    }
  }
  for (const change of changes) {
    const deps = [...(change.before?.depends_on || []), ...(change.after?.depends_on || [])];
    change.kind = change.grounded ? "direct" : deps.some((id) => directIds.has(id)) ? "cascade" : "unattributed";
  }
  return { memoryId, changes, costDelta: (Number(afterPlan.total_cost) || 0) - (Number(beforePlan.total_cost) || 0) };
}

function changeText(change) {
  if (!change.before) return `新增 ${change.after.title}`;
  if (!change.after) return `移除 ${change.before.title}`;
  const parts = [];
  if (change.before.title !== change.after.title) parts.push(`${change.before.title} → ${change.after.title}`);
  if (change.before.time !== change.after.time) parts.push(`${change.before.time} → ${change.after.time}`);
  if (Number(change.before.cost) !== Number(change.after.cost)) parts.push(`$${change.before.cost} → $${change.after.cost}`);
  return parts.join("；") || `${change.fields.join("、")}变化`;
}

async function callPlan(memories, mode, intervention = null) {
  const response = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ request: REQUEST, memories: memoryPayload(memories), mode, intervention, reference_plan: mode === "counterfactual" ? state.basePlan : null }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  state.model = data.model || state.model;
  return data.plan;
}

async function beginTrial() {
  if (!state.apiReady || state.loading) return;
  state.loading = true; state.error = null; render();
  try {
    state.basePlan = await callPlan(state.memories, "baseline");
    state.startedAt = Date.now(); state.phaseStartedAt = state.startedAt;
    log("trial_started", { model: state.model });
    setPhase(1);
  } catch (error) { state.error = error.message; toast(error.message); }
  finally { state.loading = false; render(); }
}

async function runPreview() {
  const memory = memoryById(state.selectedMemoryId);
  if (!memory || state.sandboxValue === memory.value || state.loading) return;
  const sandbox = structuredClone(state.memories);
  sandbox.find((item) => item.id === memory.id).value = state.sandboxValue;
  state.loading = true; state.error = null; log("impact_requested", { memory_id: memory.id, before: memory.value, after: state.sandboxValue }); render();
  try {
    state.previewPlan = await callPlan(sandbox, "counterfactual", { memory_id: memory.id, before: memory.value, after: state.sandboxValue });
    state.impact = computeImpact(state.basePlan, state.previewPlan, memory.id);
    state.planView = "preview";
    log("impact_received", { changes: state.impact.changes.length, cost_delta: state.impact.costDelta });
    toast(`观察到 ${state.impact.changes.length} 个决策节点变化`);
  } catch (error) { state.error = error.message; toast(error.message); }
  finally { state.loading = false; render(); }
}

function applyImpact() {
  const memory = memoryById(state.selectedMemoryId);
  memory.value = state.sandboxValue;
  memory.provenance = "本次用户修正";
  memory.origin = "Sandbox commit";
  state.applied = true;
  state.planView = "preview";
  log("impact_applied", { memory_id: memory.id, value: memory.value });
  setPhase(4);
}

function skipRepair() {
  state.skippedRepair = true;
  state.planView = "base";
  log("repair_skipped");
  setPhase(4);
}

function calculateMetrics() {
  const baseAffected = attributedIds(state.basePlan, "travel_with_child").size > 0;
  const diagnosis = state.diagnosisSource === "memory" && state.diagnosisMemoryId === "travel_with_child";
  const repair = memoryById("travel_with_child").value === "solo" && state.applied;
  const expectedInitial = baseAffected ? "reject" : "accept";
  const expectedFinal = repair ? "accept" : baseAffected ? "reject" : "accept";
  return { diagnosis, repair, initialReliance: state.initialDecision === expectedInitial, finalReliance: state.finalDecision === expectedFinal, seconds: Math.round(((state.completedAt || Date.now()) - state.startedAt) / 1000) };
}

function exportTrial() {
  const payload = { participant_id: "P-017", condition: "impact_preview", scenario: "kyoto_03", metrics: calculateMetrics(), decisions: { initial: state.initialDecision, initial_confidence: state.initialConfidence, diagnosis_source: state.diagnosisSource, diagnosis_memory_id: state.diagnosisMemoryId, repair_applied: state.applied, final: state.finalDecision, final_confidence: state.finalConfidence }, impact: state.impact, events: state.events };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = "memory-impact-trial-P017.json"; link.click(); URL.revokeObjectURL(url);
}

function render() { renderProgress(); renderMemories(); renderPlan(); renderTask(); }

el.viewToggle.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => { state.planView = button.dataset.planView; log("plan_view_changed", { value: state.planView }); renderPlan(); }));
setInterval(() => {
  if (!state.startedAt) return;
  const seconds = Math.floor(((state.completedAt || Date.now()) - state.startedAt) / 1000);
  el.elapsed.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}, 1000);

render();
checkApi();
