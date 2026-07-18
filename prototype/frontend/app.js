const INITIAL_MEMORIES = [
  {
    id: "travel_with_child",
    label: "同行者",
    value: "with_child",
    display: "通常与 6 岁孩子同行",
    status: "stale",
    statusLabel: "可能过期",
    source: "2025 年大阪家庭旅行",
    options: [
      { value: "with_child", label: "这次与孩子同行" },
      { value: "solo", label: "这次独自出行" }
    ]
  },
  {
    id: "mobility",
    label: "步行强度",
    value: "low_walking",
    display: "每天尽量少于 8,000 步",
    status: "active",
    statusLabel: "已确认",
    source: "近期健康偏好",
    options: [
      { value: "low_walking", label: "低步行强度" },
      { value: "moderate_walking", label: "可接受中等步行" },
      { value: "no_limit", label: "不限制步行强度" }
    ]
  },
  {
    id: "hotel_priority",
    label: "住宿位置",
    value: "central",
    display: "优先住市中心，减少换乘",
    status: "active",
    statusLabel: "已确认",
    source: "最近两次旅行选择",
    options: [
      { value: "central", label: "优先市中心" },
      { value: "traditional", label: "优先传统住宿体验" },
      { value: "value", label: "优先性价比" }
    ]
  },
  {
    id: "pace",
    label: "行程节奏",
    value: "relaxed",
    display: "每天 2 至 3 个主要安排",
    status: "inferred",
    statusLabel: "系统推断",
    source: "根据历史行程密度推断",
    options: [
      { value: "relaxed", label: "轻松：2 至 3 项" },
      { value: "balanced", label: "均衡：3 至 4 项" },
      { value: "packed", label: "紧凑：4 项以上" }
    ]
  },
  {
    id: "interests",
    label: "主要兴趣",
    value: "local_culture",
    display: "当地文化、手工艺与传统街区",
    status: "active",
    statusLabel: "已确认",
    source: "收藏和明确表达",
    options: [
      { value: "local_culture", label: "当地文化与手工艺" },
      { value: "nature", label: "自然景观" },
      { value: "food", label: "饮食体验" }
    ]
  },
  {
    id: "diet",
    label: "饮食限制",
    value: "vegetarian",
    display: "需要可靠的素食正餐",
    status: "active",
    statusLabel: "已确认",
    source: "用户明确说明",
    options: [
      { value: "vegetarian", label: "素食" },
      { value: "none", label: "无饮食限制" }
    ]
  },
  {
    id: "start_time",
    label: "开始时间",
    value: "avoid_early",
    display: "不安排 8:30 前开始的活动",
    status: "active",
    statusLabel: "已确认",
    source: "多次拒绝早班安排",
    options: [
      { value: "avoid_early", label: "避免早于 8:30" },
      { value: "early_ok", label: "可以早起" }
    ]
  },
  {
    id: "budget",
    label: "当地预算",
    value: "700",
    display: "三天约 700 美元",
    status: "active",
    statusLabel: "已确认",
    source: "当前旅行预算",
    options: [
      { value: "550", label: "约 550 美元" },
      { value: "700", label: "约 700 美元" },
      { value: "900", label: "约 900 美元" }
    ]
  }
];

const DEFAULT_REQUEST = "请安排 3 天京都行程，不要太赶，预算约 700 美元，不包含国际机票。";

const elements = {
  apiStatus: document.querySelector("#apiStatus"),
  generateButton: document.querySelector("#generateButton"),
  resetButton: document.querySelector("#resetButton"),
  tripRequest: document.querySelector("#tripRequest"),
  memoryList: document.querySelector("#memoryList"),
  memoryCount: document.querySelector("#memoryCount"),
  memoryEditor: document.querySelector("#memoryEditor"),
  planMeta: document.querySelector("#planMeta"),
  planSurface: document.querySelector("#planSurface"),
  impactBadge: document.querySelector("#impactBadge"),
  impactSurface: document.querySelector("#impactSurface"),
  toast: document.querySelector("#toast")
};

const state = {
  memories: structuredClone(INITIAL_MEMORIES),
  selectedMemoryId: INITIAL_MEMORIES[0].id,
  sandboxValue: INITIAL_MEMORIES[0].options[1].value,
  basePlan: null,
  previewPlan: null,
  impact: null,
  loading: null,
  error: null,
  apiReady: false,
  model: "DeepSeek"
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function selectedMemory() {
  return state.memories.find((memory) => memory.id === state.selectedMemoryId) || state.memories[0];
}

function displayFor(memory, value = memory.value) {
  return memory.options.find((option) => option.value === value)?.label || value;
}

function memoryPayload(memories = state.memories) {
  return memories.map(({ id, label, value, status, source }) => ({ id, label, value, status, source }));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2800);
}

async function checkApi() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    state.apiReady = Boolean(data.configured);
    state.model = data.model || "DeepSeek";
    elements.apiStatus.className = `api-status ${state.apiReady ? "is-ready" : "is-error"}`;
    elements.apiStatus.innerHTML = `<span class="status-dot"></span><span>${state.apiReady ? escapeHtml(state.model) : "缺少 DEEPSEEK_API_KEY"}</span>`;
    elements.generateButton.disabled = !state.apiReady;
  } catch (error) {
    state.apiReady = false;
    elements.apiStatus.className = "api-status is-error";
    elements.apiStatus.innerHTML = '<span class="status-dot"></span><span>本地服务不可用</span>';
    elements.generateButton.disabled = true;
  }
}

function renderMemories() {
  elements.memoryCount.textContent = `${state.memories.length} 条`;
  elements.memoryList.innerHTML = state.memories
    .map((memory) => {
      const selected = memory.id === state.selectedMemoryId;
      return `
        <button class="memory-card ${selected ? "is-selected" : ""}" data-memory-id="${escapeHtml(memory.id)}" type="button">
          <span class="memory-topline">
            <span class="memory-label">${escapeHtml(memory.label)}</span>
            <span class="memory-status ${escapeHtml(memory.status)}">${escapeHtml(memory.statusLabel)}</span>
          </span>
          <span class="memory-value">${escapeHtml(displayFor(memory))}</span>
          <span class="memory-bottomline">
            <span class="memory-source">${escapeHtml(memory.source)}</span>
          </span>
        </button>`;
    })
    .join("");

  elements.memoryList.querySelectorAll("[data-memory-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const memory = state.memories.find((item) => item.id === button.dataset.memoryId);
      state.selectedMemoryId = memory.id;
      state.sandboxValue = memory.options.find((option) => option.value !== memory.value)?.value || memory.value;
      state.previewPlan = null;
      state.impact = null;
      render();
    });
  });
}

function renderEditor() {
  const memory = selectedMemory();
  const hasChange = state.sandboxValue !== memory.value;
  elements.memoryEditor.innerHTML = `
    <h3 class="editor-title">${escapeHtml(memory.label)}</h3>
    <p class="editor-source">来源：${escapeHtml(memory.source)}</p>
    <div class="editor-form">
      <label>
        <span class="field-label">Sandbox 值</span>
        <select id="sandboxSelect">
          ${memory.options
            .map(
              (option) =>
                `<option value="${escapeHtml(option.value)}" ${option.value === state.sandboxValue ? "selected" : ""}>${escapeHtml(option.label)}</option>`
            )
            .join("")}
        </select>
      </label>
      <div class="editor-note">当前值：${escapeHtml(displayFor(memory))}${hasChange ? `<br>预演值：${escapeHtml(displayFor(memory, state.sandboxValue))}` : ""}</div>
      <button id="previewButton" class="button button-primary" type="button" ${!state.basePlan || !hasChange || state.loading ? "disabled" : ""}>
        ${state.loading === "preview" ? "正在重跑…" : "预演这项修改"}
      </button>
    </div>`;

  document.querySelector("#sandboxSelect").addEventListener("change", (event) => {
    state.sandboxValue = event.target.value;
    state.previewPlan = null;
    state.impact = null;
    renderEditor();
    renderImpact();
  });
  document.querySelector("#previewButton").addEventListener("click", previewImpact);
}

function typeLabel(type) {
  const labels = {
    hotel: "住宿",
    activity: "活动",
    meal: "餐饮",
    transit: "交通",
    rest: "休息"
  };
  return labels[type] || type || "安排";
}

function renderDecision(item) {
  const memories = (item.memory_ids || [])
    .map((id) => state.memories.find((memory) => memory.id === id)?.label || id)
    .join("、");
  return `
    <article class="decision-item" data-decision-id="${escapeHtml(item.id)}">
      <time class="decision-time">${escapeHtml(item.time)}</time>
      <div>
        <div class="decision-topline">
          <h4 class="decision-title">${escapeHtml(item.title)}</h4>
          <span class="type-badge">${escapeHtml(typeLabel(item.type))}</span>
        </div>
        <p class="decision-description">${escapeHtml(item.description)}</p>
        <div class="decision-meta">
          <span>${escapeHtml(item.location)}</span>
          <span>${Number(item.duration_minutes) || 0} 分钟</span>
          <span>$${Number(item.cost) || 0}</span>
          ${memories ? `<span class="memory-reasons">Memory：${escapeHtml(memories)}</span>` : ""}
        </div>
      </div>
    </article>`;
}

function renderPlan() {
  elements.generateButton.disabled = !state.apiReady || Boolean(state.loading);
  elements.generateButton.textContent = state.loading === "base" ? "DeepSeek 规划中…" : "重新生成初始行程";

  if (state.loading === "base") {
    elements.planMeta.innerHTML = '<span class="pill accent">Generating</span>';
    elements.planSurface.innerHTML = `
      <div class="loading-plan"><div class="loading-inner"><h3>正在生成决策图</h3><p>DeepSeek 正在权衡记忆、地点、预算和行程依赖。</p><div class="loading-bar"></div></div></div>`;
    return;
  }

  if (state.error && !state.basePlan) {
    elements.planMeta.innerHTML = "";
    elements.planSurface.innerHTML = `<div class="error-panel"><div class="error-inner"><h3>生成失败</h3><p>${escapeHtml(state.error)}</p></div></div>`;
    return;
  }

  const plan = state.basePlan;
  if (!plan) {
    elements.planMeta.innerHTML = "";
    elements.planSurface.innerHTML = `
      <div class="empty-plan"><div class="empty-plan-inner"><h3>尚未生成行程</h3><p>生成后可以修改左侧任意一条持久记忆，并在提交前查看整份行程的变化。</p></div></div>`;
    return;
  }

  const itemCount = flattenPlan(plan).length;
  elements.planMeta.innerHTML = `
    <span class="pill accent">${escapeHtml(state.model)}</span>
    <span class="pill">${itemCount} 个决策节点</span>`;

  const lodging = plan.lodging ? `
    <section class="day-section">
      <div class="day-title"><span class="day-number">BASE</span><h3>住宿基点</h3></div>
      <div class="decision-list">${renderDecision(plan.lodging)}</div>
    </section>` : "";

  elements.planSurface.innerHTML = `
    <section class="plan-summary">
      <div class="plan-summary-top">
        <div><h3>${escapeHtml(plan.title)}</h3><p>${escapeHtml(plan.summary)}</p></div>
        <div class="cost-block"><strong>$${Number(plan.total_cost) || 0}</strong><span>预计总支出</span></div>
      </div>
    </section>
    <div class="day-list">
      ${lodging}
      ${(plan.days || [])
        .map(
          (day) => `
            <section class="day-section">
              <div class="day-title"><span class="day-number">DAY ${escapeHtml(day.day)}</span><h3>${escapeHtml(day.theme)}</h3></div>
              <div class="decision-list">${(day.items || []).map(renderDecision).join("")}</div>
            </section>`
        )
        .join("")}
    </div>
    ${(plan.tradeoffs || []).length ? `<section class="tradeoff-section"><h3>Agent 权衡</h3><ul>${plan.tradeoffs.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>` : ""}`;
}

function flattenPlan(plan) {
  if (!plan) return [];
  const items = [];
  if (plan.lodging) items.push(plan.lodging);
  for (const day of plan.days || []) {
    for (const item of day.items || []) {
      items.push({ ...item, day: day.day });
    }
  }
  return items;
}

function changedFields(before, after) {
  const fields = ["title", "time", "location", "cost", "duration_minutes"];
  return fields.filter((field) => String(before?.[field] ?? "") !== String(after?.[field] ?? ""));
}

function attributedDecisionIds(plan, memoryId) {
  const usage = (plan.memory_usage || []).find((item) => item.memory_id === memoryId);
  return new Set(usage?.decisions || []);
}

function computeImpact(beforePlan, afterPlan, memoryId, beforeValue, afterValue) {
  const beforeItems = new Map(flattenPlan(beforePlan).map((item) => [item.id, item]));
  const afterItems = new Map(flattenPlan(afterPlan).map((item) => [item.id, item]));
  const allIds = new Set([...beforeItems.keys(), ...afterItems.keys()]);
  const changes = [];
  const directIds = new Set([
    ...attributedDecisionIds(beforePlan, memoryId),
    ...attributedDecisionIds(afterPlan, memoryId)
  ]);

  for (const id of allIds) {
    const before = beforeItems.get(id);
    const after = afterItems.get(id);
    const fields = changedFields(before, after);
    if (!before || !after || fields.length) {
      const directlyGrounded = [...(before?.memory_ids || []), ...(after?.memory_ids || [])].includes(memoryId);
      if (directlyGrounded) directIds.add(id);
      changes.push({ id, before, after, fields, directlyGrounded });
    }
  }

  for (const change of changes) {
    const dependencies = [...(change.before?.depends_on || []), ...(change.after?.depends_on || [])];
    change.kind = change.directlyGrounded || directIds.has(change.id)
      ? "direct"
      : dependencies.some((id) => directIds.has(id))
        ? "cascade"
        : "unattributed";
  }

  const unchanged = [...allIds].filter((id) => !changes.some((change) => change.id === id)).length;
  const beforeCost = Number(beforePlan.total_cost) || 0;
  const afterCost = Number(afterPlan.total_cost) || 0;
  return {
    memoryId,
    beforeValue,
    afterValue,
    changes,
    unchanged,
    costDelta: afterCost - beforeCost,
    beforeCost,
    afterCost
  };
}

function changeDescription(change) {
  if (!change.before) return `新增：${change.after.title}`;
  if (!change.after) return `移除：${change.before.title}`;
  const parts = [];
  if (change.before.title !== change.after.title) parts.push(`${change.before.title} → ${change.after.title}`);
  if (change.before.time !== change.after.time) parts.push(`时间 ${change.before.time} → ${change.after.time}`);
  if (Number(change.before.cost) !== Number(change.after.cost)) parts.push(`费用 $${change.before.cost} → $${change.after.cost}`);
  if (!parts.length) parts.push(`${change.fields.map((field) => field.replace("duration_minutes", "时长")).join("、")}发生变化`);
  return parts.join("；");
}

function renderImpact() {
  if (state.loading === "preview") {
    elements.impactBadge.textContent = "重跑中";
    elements.impactSurface.innerHTML = `<div class="loading-plan"><div class="loading-inner"><h3>正在执行反事实计划</h3><p>仅替换所选 memory，其余输入保持不变。</p><div class="loading-bar"></div></div></div>`;
    return;
  }

  const impact = state.impact;
  if (!impact) {
    elements.impactBadge.textContent = "待预演";
    elements.impactSurface.innerHTML = `<div class="impact-placeholder">选择一条 memory，设置 sandbox 值并重跑计划。</div>`;
    return;
  }

  const memory = state.memories.find((item) => item.id === impact.memoryId);
  const direct = impact.changes.filter((change) => change.kind === "direct");
  const cascade = impact.changes.filter((change) => change.kind === "cascade");
  const unattributed = impact.changes.filter((change) => change.kind === "unattributed");
  elements.impactBadge.textContent = `${impact.changes.length} 项变化`;
  elements.impactSurface.innerHTML = `
    <div class="impact-memory">
      <strong>${escapeHtml(memory.label)}</strong><br>
      ${escapeHtml(displayFor(memory, impact.beforeValue))} → ${escapeHtml(displayFor(memory, impact.afterValue))}
    </div>
    <div class="impact-overview">
      <div class="impact-stat"><strong>${direct.length}</strong><span>直接影响</span></div>
      <div class="impact-stat"><strong>${cascade.length}</strong><span>连锁变化</span></div>
      <div class="impact-stat"><strong>${unattributed.length}</strong><span>未归因变化</span></div>
      <div class="impact-stat"><strong>${impact.costDelta >= 0 ? "+" : ""}$${impact.costDelta}</strong><span>预算变化</span></div>
    </div>
    ${direct.length ? renderImpactSection("直接影响", direct, "direct") : ""}
    ${cascade.length ? renderImpactSection("连锁变化", cascade, "cascade") : ""}
    ${unattributed.length ? renderImpactSection("未归因变化", unattributed, "removed") : ""}
    ${!impact.changes.length ? `<div class="impact-placeholder">这次重跑未观察到决策节点变化。总预算保持 $${impact.beforeCost}。</div>` : ""}
    <section class="impact-section"><h3>保持稳定</h3><div class="impact-change"><p>${impact.unchanged} 个决策节点未变化；修改前后均使用相同请求、目录和模型参数。</p></div></section>
    <div class="impact-actions">
      <button id="discardPreview" class="button button-secondary" type="button">放弃</button>
      <button id="applyPreview" class="button button-primary" type="button">应用修改</button>
    </div>`;

  document.querySelector("#discardPreview").addEventListener("click", discardPreview);
  document.querySelector("#applyPreview").addEventListener("click", applyPreview);
}

function renderImpactSection(title, changes, className) {
  return `
    <section class="impact-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="impact-change-list">
        ${changes
          .map(
            (change) => `
              <article class="impact-change ${className}">
                <div class="impact-change-top">
                  <span class="impact-change-title">${escapeHtml(change.after?.id || change.before?.id)}</span>
                  <span class="impact-change-kind">${change.before && change.after ? "替换" : change.after ? "新增" : "移除"}</span>
                </div>
                <p>${escapeHtml(changeDescription(change))}</p>
              </article>`
          )
          .join("")}
      </div>
    </section>`;
}

function render() {
  renderMemories();
  renderEditor();
  renderPlan();
  renderImpact();
}

async function requestPlan(memories, mode, intervention = null) {
  const response = await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      request: elements.tripRequest.value.trim(),
      memories: memoryPayload(memories),
      mode,
      intervention,
      reference_plan: mode === "counterfactual" ? state.basePlan : null
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `请求失败（${response.status}）`);
  state.model = data.model || state.model;
  return data.plan;
}

async function generateBasePlan() {
  if (!state.apiReady || state.loading) return;
  state.loading = "base";
  state.error = null;
  state.previewPlan = null;
  state.impact = null;
  render();
  try {
    state.basePlan = await requestPlan(state.memories, "baseline");
    showToast("初始行程已生成");
  } catch (error) {
    state.error = error.message;
    showToast(error.message);
  } finally {
    state.loading = null;
    render();
  }
}

async function previewImpact() {
  const memory = selectedMemory();
  if (!state.basePlan || state.sandboxValue === memory.value || state.loading) return;
  const sandboxMemories = structuredClone(state.memories);
  sandboxMemories.find((item) => item.id === memory.id).value = state.sandboxValue;
  state.loading = "preview";
  state.error = null;
  render();
  try {
    state.previewPlan = await requestPlan(sandboxMemories, "counterfactual", {
      memory_id: memory.id,
      before: memory.value,
      after: state.sandboxValue
    });
    state.impact = computeImpact(state.basePlan, state.previewPlan, memory.id, memory.value, state.sandboxValue);
    showToast(`反事实重跑完成：观察到 ${state.impact.changes.length} 项变化`);
  } catch (error) {
    state.error = error.message;
    showToast(error.message);
  } finally {
    state.loading = null;
    render();
  }
}

function discardPreview() {
  const memory = selectedMemory();
  state.sandboxValue = memory.options.find((option) => option.value !== memory.value)?.value || memory.value;
  state.previewPlan = null;
  state.impact = null;
  showToast("已放弃 sandbox 修改");
  render();
}

function applyPreview() {
  if (!state.previewPlan || !state.impact) return;
  const memory = selectedMemory();
  memory.value = state.sandboxValue;
  memory.display = displayFor(memory);
  memory.status = "active";
  memory.statusLabel = "用户修正";
  memory.source = "本次 sandbox 提交";
  state.basePlan = state.previewPlan;
  state.previewPlan = null;
  state.impact = null;
  showToast("Memory 修改和新行程已应用");
  render();
}

function resetDemo() {
  state.memories = structuredClone(INITIAL_MEMORIES);
  state.selectedMemoryId = INITIAL_MEMORIES[0].id;
  state.sandboxValue = INITIAL_MEMORIES[0].options[1].value;
  state.basePlan = null;
  state.previewPlan = null;
  state.impact = null;
  state.loading = null;
  state.error = null;
  elements.tripRequest.value = DEFAULT_REQUEST;
  showToast("Demo 已重置");
  render();
}

elements.generateButton.addEventListener("click", generateBasePlan);
elements.resetButton.addEventListener("click", resetDemo);
elements.tripRequest.addEventListener("input", () => {
  if (state.basePlan) {
    state.previewPlan = null;
    state.impact = null;
    renderImpact();
  }
});

render();
checkApi();
