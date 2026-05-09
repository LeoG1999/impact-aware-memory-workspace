const memoryItems = [
  {
    id: "mem_budget",
    label: "Budget limit",
    value: "Under $80 per person",
    status: "outdated",
    certainty: "confirmed",
    source: "Stated in an older conversation",
    lastUsed: "Used in the most recent recommendation",
    copy: "The assistant is currently treating budget as a hard cap.",
    impact: {
      summary: "This memory item strongly shaped candidate filtering and final ranking.",
      usedIn: ["Recent dining recommendation", "Two rejected alternatives"],
      likelyChanges: ["Higher-priced vegetarian options may re-enter the candidate set."],
      conflicts: ["No direct conflict, but this may suppress ambiance and quality preferences."]
    }
  },
  {
    id: "mem_diet",
    label: "Dietary constraint",
    value: "Vegetarian",
    status: "active",
    certainty: "confirmed",
    source: "Explicit user preference",
    lastUsed: "Used in the most recent recommendation",
    copy: "This is treated as a hard constraint during retrieval and ranking.",
    impact: {
      summary: "This memory item excludes non-vegetarian venues from all candidate sets.",
      usedIn: ["Recent dining recommendation", "Shortlist generation"],
      likelyChanges: ["Editing this item would materially change the entire search space."],
      conflicts: ["No conflict currently detected."]
    }
  },
  {
    id: "mem_noise",
    label: "Noise preference",
    value: "Quiet or calm places only",
    status: "uncertain",
    certainty: "inferred",
    source: "Inferred from past rejections",
    lastUsed: "Used in 1 recent recommendation",
    copy: "The system inferred this preference rather than storing it from a direct statement.",
    impact: {
      summary: "This memory item influences ranking, but with lower confidence than hard constraints.",
      usedIn: ["Recent dining recommendation"],
      likelyChanges: ["Livelier venues may rise in ranking if this is removed or weakened."],
      conflicts: ["Potential conflict with a prior preference for social dining spots."]
    }
  }
];

const memoryList = document.querySelector("#memoryList");
const impactPanel = document.querySelector("#impactPanel");
const impactTitle = document.querySelector("#impactTitle");
const toggleModeButton = document.querySelector("#toggleMode");

let selectedId = memoryItems[0].id;

function tagClass(status) {
  if (status === "outdated") {
    return "tag-outdated";
  }
  if (status === "uncertain") {
    return "tag-uncertain";
  }
  return "tag-active";
}

function renderMemoryList() {
  memoryList.innerHTML = "";

  for (const item of memoryItems) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `memory-item${item.id === selectedId ? " is-selected" : ""}`;
    button.dataset.id = item.id;
    button.innerHTML = `
      <div class="memory-topline">
        <span class="memory-label">${item.label}</span>
        <span class="tag ${tagClass(item.status)}">${item.status}</span>
      </div>
      <p class="memory-copy">${item.value}</p>
      <div class="memory-bottomline">
        <span class="memory-meta">${item.certainty}</span>
        <span class="memory-meta">${item.lastUsed}</span>
      </div>
    `;

    button.addEventListener("click", () => {
      selectedId = item.id;
      renderMemoryList();
      renderImpactPanel();
    });

    memoryList.appendChild(button);
  }
}

function renderImpactPanel() {
  const item = memoryItems.find((entry) => entry.id === selectedId);
  if (!item) {
    impactTitle.textContent = "Select a memory item";
    impactPanel.className = "impact-empty";
    impactPanel.textContent = "Choose a memory item to inspect its certainty, recent usage, and likely effects.";
    return;
  }

  impactTitle.textContent = item.label;
  impactPanel.className = "impact-card";
  impactPanel.innerHTML = `
    <div class="impact-block">
      <p class="card-label">State</p>
      <p class="impact-copy">${item.copy}</p>
    </div>
    <div class="impact-block">
      <p class="card-label">Source and certainty</p>
      <p class="impact-copy">${item.source}. Current certainty: ${item.certainty}.</p>
    </div>
    <div class="impact-block">
      <p class="card-label">Used in</p>
      <ul class="impact-list">
        ${item.impact.usedIn.map((entry) => `<li>${entry}</li>`).join("")}
      </ul>
    </div>
    <div class="impact-block">
      <p class="card-label">Likely effects if changed</p>
      <ul class="impact-list">
        ${item.impact.likelyChanges.map((entry) => `<li>${entry}</li>`).join("")}
      </ul>
    </div>
    <div class="impact-block">
      <p class="card-label">Conflicts</p>
      <ul class="impact-list">
        ${item.impact.conflicts.map((entry) => `<li>${entry}</li>`).join("")}
      </ul>
    </div>
  `;
}

toggleModeButton.addEventListener("click", () => {
  document.body.classList.toggle("chat-only");
  toggleModeButton.textContent = document.body.classList.contains("chat-only")
    ? "Switch to Editable Memory"
    : "Switch to Chat-only";
});

renderMemoryList();
renderImpactPanel();
