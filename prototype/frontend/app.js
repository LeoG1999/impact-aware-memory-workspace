const CONDITIONS = {
  chat: {
    label: "Chat-only",
    memoryVisible: false,
    memoryEditable: false,
    impactVisible: false
  },
  editable: {
    label: "Editable Memory",
    memoryVisible: true,
    memoryEditable: true,
    impactVisible: false
  },
  impact: {
    label: "Editable Memory + Impact Preview",
    memoryVisible: true,
    memoryEditable: true,
    impactVisible: true
  }
};

const TASKS = [
  { id: "choose", title: "Choose", badge: "Step 1 of 3" },
  { id: "audit", title: "Audit", badge: "Step 2 of 3" },
  { id: "revise", title: "Revise", badge: "Step 3 of 3" },
  { id: "complete", title: "Pack Complete", badge: "Finished" }
];

const PACKS = [
  {
    id: "pilot_pack_01_stale_budget",
    shortLabel: "Pack 01",
    primaryError: "Outdated budget memory",
    studyNote: "This pack tests whether participants notice that a stale budget cap is filtering out the best matching venue.",
    goalTitle: "Find a calm vegetarian dinner spot for tonight.",
    goalBullets: [
      "The user is willing to spend up to $150 per person.",
      "The restaurant should be within 30 minutes of travel.",
      "The user strongly prefers quiet places for conversation.",
      "Mediterranean cuisine is preferred, but not required."
    ],
    trueState: {
      dietary_constraint: "vegetarian",
      budget_limit: 150,
      distance_limit: 30,
      time_window: "tonight",
      noise_preference: "quiet",
      cuisine_preference: "mediterranean"
    },
    memory: [
      {
        id: "mem_budget",
        key: "budget_limit",
        label: "Budget limit",
        value: 80,
        status: "outdated",
        certainty: "confirmed",
        source: "Stated in an older conversation",
        last_used: "Used in the last recommendation",
        options: [80, 150],
        impact: {
          state: "The assistant is currently treating the budget as a hard cap under $80.",
          usedIn: ["Initial candidate filtering", "Final recommendation ranking"],
          likelyAffects: ["Budget-based filtering", "Whether premium vegetarian options appear at all"],
          conflicts: ["This looks stale relative to the current user brief."]
        }
      },
      {
        id: "mem_diet",
        key: "dietary_constraint",
        label: "Dietary constraint",
        value: "vegetarian",
        status: "active",
        certainty: "confirmed",
        source: "Explicit user preference",
        last_used: "Used in the last recommendation",
        options: ["vegetarian"],
        impact: {
          state: "This item is treated as a hard constraint.",
          usedIn: ["Initial candidate filtering", "Final recommendation ranking"],
          likelyAffects: ["Which venues stay in the candidate set"],
          conflicts: ["No active conflict detected."]
        }
      },
      {
        id: "mem_distance",
        key: "distance_limit",
        label: "Distance limit",
        value: 30,
        status: "active",
        certainty: "confirmed",
        source: "Recent planning message",
        last_used: "Used in the last recommendation",
        options: [30],
        impact: {
          state: "This item filters out venues outside the travel radius.",
          usedIn: ["Initial candidate filtering"],
          likelyAffects: ["Travel-based filtering"],
          conflicts: ["No active conflict detected."]
        }
      },
      {
        id: "mem_noise",
        key: "noise_preference",
        label: "Noise preference",
        value: "quiet",
        status: "uncertain",
        certainty: "inferred",
        source: "Inferred from previous rejections",
        last_used: "Used in the last recommendation",
        options: ["quiet", "no_preference"],
        impact: {
          state: "This preference currently boosts quiet venues, but its certainty is lower than the hard constraints.",
          usedIn: ["Final ranking"],
          likelyAffects: ["Ranking among candidate venues"],
          conflicts: ["No active conflict, but it remains inferred rather than explicit."]
        }
      },
      {
        id: "mem_cuisine",
        key: "cuisine_preference",
        label: "Cuisine preference",
        value: "mediterranean",
        status: "active",
        certainty: "inferred",
        source: "Inferred from recent choices",
        last_used: "Used in the last recommendation",
        options: ["mediterranean", "no_preference"],
        impact: {
          state: "This preference influences ranking after hard constraints are applied.",
          usedIn: ["Final ranking"],
          likelyAffects: ["Cuisine-based ranking"],
          conflicts: ["No active conflict detected."]
        }
      }
    ],
    candidates: [
      {
        id: "oak",
        name: "Oak Ember Bistro",
        price: 68,
        vegetarian: true,
        quiet: true,
        distance: 22,
        cuisine: "new american",
        quality: 3,
        summary: "Calm dining room with reliable vegetarian plates and table service."
      },
      {
        id: "saffron",
        name: "Saffron Table",
        price: 132,
        vegetarian: true,
        quiet: true,
        distance: 18,
        cuisine: "mediterranean",
        quality: 5,
        summary: "Quiet Mediterranean spot with strong vegetarian tasting options."
      },
      {
        id: "luna",
        name: "Luna Garden Cafe",
        price: 95,
        vegetarian: true,
        quiet: false,
        distance: 12,
        cuisine: "mediterranean",
        quality: 4,
        summary: "Convenient and affordable, but usually louder than the user prefers."
      },
      {
        id: "ramen",
        name: "Ramen Social",
        price: 42,
        vegetarian: false,
        quiet: false,
        distance: 14,
        cuisine: "japanese",
        quality: 3,
        summary: "Cheap and close, but poor fit for a calm vegetarian dinner."
      }
    ],
    gold: {
      correctFinalId: "saffron"
    }
  },
  {
    id: "pilot_pack_02_missing_dietary_constraint",
    shortLabel: "Pack 02",
    primaryError: "Missing dietary constraint",
    studyNote: "This pack tests whether participants detect an omitted hard constraint and repair it before trusting the recommendation.",
    goalTitle: "Choose a dinner spot for a vegetarian colleague.",
    goalBullets: [
      "The group wants a celebratory dinner with some energy.",
      "The restaurant must support a vegetarian colleague.",
      "The budget should stay under $90 per person.",
      "Travel time should stay within 20 minutes."
    ],
    trueState: {
      dietary_constraint: "vegetarian",
      budget_limit: 90,
      distance_limit: 20,
      time_window: "tonight",
      noise_preference: "lively",
      cuisine_preference: "no_preference"
    },
    memory: [
      {
        id: "mem_budget",
        key: "budget_limit",
        label: "Budget limit",
        value: 90,
        status: "active",
        certainty: "confirmed",
        source: "Recent group planning note",
        last_used: "Used in the last recommendation",
        options: [90],
        impact: {
          state: "This item filters out venues above the per-person budget.",
          usedIn: ["Initial candidate filtering"],
          likelyAffects: ["Budget-based filtering"],
          conflicts: ["No active conflict detected."]
        }
      },
      {
        id: "mem_diet",
        key: "dietary_constraint",
        label: "Dietary constraint",
        value: "none",
        status: "conflicted",
        certainty: "missing",
        source: "No structured dietary memory stored",
        last_used: "Not used in the last recommendation",
        options: ["none", "vegetarian"],
        impact: {
          state: "The assistant currently has no hard dietary restriction stored.",
          usedIn: ["Initial candidate filtering"],
          likelyAffects: ["Which venues are considered eligible"],
          conflicts: ["This omission conflicts with the real dining requirement."]
        }
      },
      {
        id: "mem_distance",
        key: "distance_limit",
        label: "Distance limit",
        value: 20,
        status: "active",
        certainty: "confirmed",
        source: "Recent group planning note",
        last_used: "Used in the last recommendation",
        options: [20],
        impact: {
          state: "This item filters out venues beyond the travel radius.",
          usedIn: ["Initial candidate filtering"],
          likelyAffects: ["Travel-based filtering"],
          conflicts: ["No active conflict detected."]
        }
      },
      {
        id: "mem_noise",
        key: "noise_preference",
        label: "Noise preference",
        value: "lively",
        status: "active",
        certainty: "confirmed",
        source: "Explicit request for a celebration dinner",
        last_used: "Used in the last recommendation",
        options: ["lively", "quiet"],
        impact: {
          state: "This item boosts energetic venues in the ranking.",
          usedIn: ["Final ranking"],
          likelyAffects: ["Atmosphere-based ranking"],
          conflicts: ["No active conflict detected."]
        }
      },
      {
        id: "mem_cuisine",
        key: "cuisine_preference",
        label: "Cuisine preference",
        value: "no_preference",
        status: "active",
        certainty: "confirmed",
        source: "No cuisine preference explicitly stated",
        last_used: "Used in the last recommendation",
        options: ["no_preference"],
        impact: {
          state: "Cuisine plays little role in the current ranking.",
          usedIn: ["Final ranking"],
          likelyAffects: ["Low effect on ranking"],
          conflicts: ["No active conflict detected."]
        }
      }
    ],
    candidates: [
      {
        id: "grill",
        name: "Harbor Grill House",
        price: 78,
        vegetarian: false,
        quiet: false,
        distance: 16,
        cuisine: "steakhouse",
        quality: 5,
        summary: "Energetic atmosphere and strong reviews, but a poor vegetarian fit."
      },
      {
        id: "mezze",
        name: "Mezze Courtyard",
        price: 84,
        vegetarian: true,
        quiet: false,
        distance: 18,
        cuisine: "mediterranean",
        quality: 4,
        summary: "Lively group-friendly venue with several vegetarian mains."
      },
      {
        id: "garden",
        name: "Garden Nook",
        price: 62,
        vegetarian: true,
        quiet: true,
        distance: 14,
        cuisine: "cafe",
        quality: 3,
        summary: "Vegetarian-friendly and close, but less suitable for a celebration."
      },
      {
        id: "tapas",
        name: "Late Table Tapas",
        price: 104,
        vegetarian: true,
        quiet: false,
        distance: 15,
        cuisine: "spanish",
        quality: 4,
        summary: "Strong group atmosphere but slightly above the budget cap."
      }
    ],
    gold: {
      correctFinalId: "mezze"
    }
  },
  {
    id: "pilot_pack_03_overconfident_inference",
    shortLabel: "Pack 03",
    primaryError: "Overconfident inferred cuisine preference",
    studyNote: "This pack tests whether participants treat an inferred cuisine preference as questionable rather than blindly reliable.",
    goalTitle: "Find a focused catch-up dinner spot for tonight.",
    goalBullets: [
      "The user needs somewhere quiet enough for a serious conversation.",
      "The budget should stay under $110 per person.",
      "Travel time should stay within 25 minutes.",
      "There is no strong cuisine preference."
    ],
    trueState: {
      dietary_constraint: "none",
      budget_limit: 110,
      distance_limit: 25,
      time_window: "tonight",
      noise_preference: "quiet",
      cuisine_preference: "no_preference"
    },
    memory: [
      {
        id: "mem_budget",
        key: "budget_limit",
        label: "Budget limit",
        value: 110,
        status: "active",
        certainty: "confirmed",
        source: "Recent planning note",
        last_used: "Used in the last recommendation",
        options: [110],
        impact: {
          state: "This item filters out venues above the current budget.",
          usedIn: ["Initial candidate filtering"],
          likelyAffects: ["Budget-based filtering"],
          conflicts: ["No active conflict detected."]
        }
      },
      {
        id: "mem_diet",
        key: "dietary_constraint",
        label: "Dietary constraint",
        value: "none",
        status: "active",
        certainty: "confirmed",
        source: "No dietary restriction stated",
        last_used: "Used in the last recommendation",
        options: ["none"],
        impact: {
          state: "This item does not filter candidates in the current pack.",
          usedIn: ["Initial candidate filtering"],
          likelyAffects: ["Minimal impact on this pack"],
          conflicts: ["No active conflict detected."]
        }
      },
      {
        id: "mem_distance",
        key: "distance_limit",
        label: "Distance limit",
        value: 25,
        status: "active",
        certainty: "confirmed",
        source: "Recent planning note",
        last_used: "Used in the last recommendation",
        options: [25],
        impact: {
          state: "This item filters out venues beyond the travel radius.",
          usedIn: ["Initial candidate filtering"],
          likelyAffects: ["Travel-based filtering"],
          conflicts: ["No active conflict detected."]
        }
      },
      {
        id: "mem_noise",
        key: "noise_preference",
        label: "Noise preference",
        value: "quiet",
        status: "active",
        certainty: "confirmed",
        source: "Explicit request for focused conversation",
        last_used: "Used in the last recommendation",
        options: ["quiet"],
        impact: {
          state: "This item should strongly shape the final ranking.",
          usedIn: ["Final ranking"],
          likelyAffects: ["Atmosphere-based ranking"],
          conflicts: ["No active conflict detected."]
        }
      },
      {
        id: "mem_cuisine",
        key: "cuisine_preference",
        label: "Cuisine preference",
        value: "japanese",
        status: "active",
        certainty: "confirmed",
        source: "Inferred from recent choices, but shown as confirmed",
        last_used: "Used in the last recommendation",
        options: ["japanese", "no_preference"],
        impact: {
          state: "This preference is currently overweighting Japanese venues in the ranking.",
          usedIn: ["Final ranking"],
          likelyAffects: ["Cuisine-based ranking among otherwise valid candidates"],
          conflicts: ["Its confidence may not match the evidence that produced it."]
        }
      }
    ],
    candidates: [
      {
        id: "izakaya",
        name: "Lantern Izakaya",
        price: 88,
        vegetarian: true,
        quiet: false,
        distance: 18,
        cuisine: "japanese",
        quality: 4,
        summary: "Well-reviewed Japanese spot, but often too lively for focused conversation."
      },
      {
        id: "atlas",
        name: "Atlas Dining Room",
        price: 102,
        vegetarian: true,
        quiet: true,
        distance: 20,
        cuisine: "new american",
        quality: 5,
        summary: "Quiet, polished dining room that better suits a serious catch-up."
      },
      {
        id: "noodle",
        name: "Noodle Alley",
        price: 36,
        vegetarian: true,
        quiet: false,
        distance: 9,
        cuisine: "japanese",
        quality: 2,
        summary: "Cheap and close, but too noisy for the user's goal."
      },
      {
        id: "terrace",
        name: "Olive Terrace",
        price: 96,
        vegetarian: true,
        quiet: true,
        distance: 27,
        cuisine: "mediterranean",
        quality: 4,
        summary: "A good atmosphere match, but beyond the current distance limit."
      }
    ],
    gold: {
      correctFinalId: "atlas"
    }
  }
];

const elements = {
  packSelect: document.querySelector("#packSelect"),
  conditionSelect: document.querySelector("#conditionSelect"),
  resetPack: document.querySelector("#resetPack"),
  exportLog: document.querySelector("#exportLog"),
  taskTitle: document.querySelector("#taskTitle"),
  taskBadge: document.querySelector("#taskBadge"),
  goalTitle: document.querySelector("#goalTitle"),
  goalBullets: document.querySelector("#goalBullets"),
  recommendationName: document.querySelector("#recommendationName"),
  recommendationSummary: document.querySelector("#recommendationSummary"),
  recommendationReasons: document.querySelector("#recommendationReasons"),
  recommendationPill: document.querySelector("#recommendationPill"),
  candidateList: document.querySelector("#candidateList"),
  memoryHeading: document.querySelector("#memoryHeading"),
  memoryModePill: document.querySelector("#memoryModePill"),
  memoryNotice: document.querySelector("#memoryNotice"),
  memoryList: document.querySelector("#memoryList"),
  memoryEditor: document.querySelector("#memoryEditor"),
  instructionTitle: document.querySelector("#instructionTitle"),
  instructionCard: document.querySelector("#instructionCard"),
  actionArea: document.querySelector("#actionArea"),
  timeline: document.querySelector("#timeline"),
  impactPanel: document.querySelector("#impactPanel"),
  activityLog: document.querySelector("#activityLog"),
  studyMeta: document.querySelector("#studyMeta"),
  scenarioNote: document.querySelector("#scenarioNote")
};

function initialState() {
  const defaultPack = PACKS[0];
  return {
    packId: defaultPack.id,
    condition: "impact",
    taskIndex: 0,
    memory: structuredClone(defaultPack.memory),
    selectedMemoryId: defaultPack.memory[0].id,
    selectedCandidateId: null,
    chooseDecision: null,
    auditAnswer: null,
    repairApplied: false,
    repairMethod: null,
    finalDecision: null,
    log: ["Scenario pack loaded."],
    events: []
  };
}

let state = initialState();

function currentTask() {
  return TASKS[state.taskIndex];
}

function getConditionConfig() {
  return CONDITIONS[state.condition];
}

function getPack(packId = state.packId) {
  return PACKS.find((pack) => pack.id === packId) || PACKS[0];
}

function currency(value) {
  return `$${value}`;
}

function displayMemoryValue(item) {
  if (item.key === "budget_limit") {
    return `Under ${currency(item.value)} per person`;
  }
  if (item.key === "distance_limit") {
    return `Within ${item.value} minutes`;
  }
  if (item.key === "dietary_constraint" && item.value === "none") {
    return "No dietary constraint stored";
  }
  if (item.key === "noise_preference" && item.value === "no_preference") {
    return "No strong noise preference";
  }
  if (item.key === "cuisine_preference" && item.value === "no_preference") {
    return "No specific cuisine preference";
  }
  return String(item.value).replaceAll("_", " ");
}

function statusClass(status) {
  if (status === "outdated") {
    return "tag-outdated";
  }
  if (status === "uncertain") {
    return "tag-uncertain";
  }
  if (status === "conflicted") {
    return "tag-conflicted";
  }
  return "tag-active";
}

function scoreCandidate(candidate, preferences) {
  if (preferences.dietary_constraint === "vegetarian" && !candidate.vegetarian) {
    return Number.NEGATIVE_INFINITY;
  }
  if (candidate.price > preferences.budget_limit) {
    return Number.NEGATIVE_INFINITY;
  }
  if (candidate.distance > preferences.distance_limit) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = candidate.quality * 2;

  if (preferences.noise_preference === "quiet" && candidate.quiet) {
    score += 3;
  }
  if (preferences.noise_preference === "quiet" && !candidate.quiet) {
    score -= 2;
  }
  if (preferences.noise_preference === "lively" && !candidate.quiet) {
    score += 2;
  }
  if (preferences.noise_preference === "lively" && candidate.quiet) {
    score -= 1;
  }
  if (preferences.cuisine_preference && preferences.cuisine_preference !== "no_preference" && preferences.cuisine_preference === candidate.cuisine) {
    score += 3;
  }

  score += Math.max(0, preferences.distance_limit - candidate.distance) / 20;
  score += Math.max(0, preferences.budget_limit - candidate.price) / 200;

  return score;
}

function recommendCandidate(preferences, pack = getPack()) {
  let bestCandidate = pack.candidates[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const candidate of pack.candidates) {
    const score = scoreCandidate(candidate, preferences);
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

function preferencesFromMemory(memoryItems) {
  const preferences = {};
  for (const item of memoryItems) {
    preferences[item.key] = item.value;
  }
  return preferences;
}

function currentRecommendation() {
  return recommendCandidate(preferencesFromMemory(state.memory), getPack());
}

function trueRecommendation() {
  const pack = getPack();
  return recommendCandidate(pack.trueState, pack);
}

function selectedMemoryItem() {
  return state.memory.find((item) => item.id === state.selectedMemoryId) || null;
}

function appendEvent(action, details = {}) {
  state.events.push({
    timestamp: new Date().toISOString(),
    pack_id: state.packId,
    condition: state.condition,
    task: currentTask().id,
    action,
    ...details
  });
}

function pushLog(message) {
  state.log = [message, ...state.log].slice(0, 8);
}

function rebuildPack(packId) {
  const pack = getPack(packId);
  state.packId = pack.id;
  state.taskIndex = 0;
  state.memory = structuredClone(pack.memory);
  state.selectedMemoryId = pack.memory[0].id;
  state.selectedCandidateId = null;
  state.chooseDecision = null;
  state.auditAnswer = null;
  state.repairApplied = false;
  state.repairMethod = null;
  state.finalDecision = null;
  state.log = ["Scenario pack loaded."];
  state.events = [];
  appendEvent("scenario_initialized");
}

function resetScenario() {
  const preservedCondition = state.condition;
  const preservedPack = state.packId;
  rebuildPack(preservedPack);
  state.condition = preservedCondition;
  appendEvent("scenario_reset");
  pushLog(`Scenario reset in ${getConditionConfig().label}.`);
  render();
}

function setCondition(condition) {
  state.condition = condition;
  appendEvent("condition_changed", { value: condition });
  resetScenario();
}

function setPack(packId) {
  const preservedCondition = state.condition;
  rebuildPack(packId);
  state.condition = preservedCondition;
  appendEvent("pack_changed", { value: packId });
  pushLog(`Loaded ${getPack().shortLabel}.`);
  render();
}

function chooseCandidate(candidateId) {
  state.selectedCandidateId = candidateId;
  appendEvent("candidate_selected", { candidate_id: candidateId });
  render();
}

function submitChoose(decisionType) {
  const pack = getPack();
  const recommendation = currentRecommendation();
  const chosenId = decisionType === "accept" ? recommendation.id : state.selectedCandidateId;

  if (!chosenId) {
    pushLog("Select a candidate before submitting the choose task.");
    render();
    return;
  }

  state.chooseDecision = chosenId;
  state.selectedCandidateId = chosenId;
  state.taskIndex = 1;

  const choiceLabel = pack.candidates.find((item) => item.id === chosenId)?.name || "Unknown";
  appendEvent("choose_submitted", { decision_type: decisionType, candidate_id: chosenId });
  pushLog(`Choose submitted: ${choiceLabel}.`);
  render();
}

function submitAudit(answer) {
  state.auditAnswer = answer;
  state.taskIndex = 2;
  appendEvent("audit_submitted", { answer });
  pushLog(`Audit submitted: recommendation marked as ${answer}.`);
  render();
}

function updateMemoryByKey(key, nextValue, lastUsedLabel) {
  const item = state.memory.find((entry) => entry.key === key);
  if (!item) {
    return false;
  }
  item.value = nextValue;
  item.status = "active";
  item.certainty = "confirmed";
  item.last_used = lastUsedLabel;
  return true;
}

function applyChatCorrection() {
  const input = document.querySelector("#chatCorrectionInput");
  const text = String(input?.value || "").trim().toLowerCase();
  const pack = getPack();

  if (!text) {
    pushLog("Enter a natural-language correction before applying it.");
    render();
    return;
  }

  let updated = false;
  if (pack.id === "pilot_pack_01_stale_budget" && (text.includes("150") || text.includes("budget"))) {
    updated = updateMemoryByKey("budget_limit", 150, "Corrected through chat");
  }
  if (pack.id === "pilot_pack_02_missing_dietary_constraint" && (text.includes("vegetarian") || text.includes("colleague"))) {
    updated = updateMemoryByKey("dietary_constraint", "vegetarian", "Corrected through chat");
  }
  if (pack.id === "pilot_pack_03_overconfident_inference" && (text.includes("no preference") || text.includes("no cuisine") || text.includes("not japanese"))) {
    updated = updateMemoryByKey("cuisine_preference", "no_preference", "Corrected through chat");
  }

  state.repairApplied = true;
  state.repairMethod = updated ? "chat correction applied" : "chat correction did not map to a structured change";
  appendEvent("chat_correction_applied", { text, updated });
  pushLog(updated ? "Chat correction updated the remembered state." : "Chat correction was recorded but no structured field changed.");
  render();
}

function updateMemoryItem(nextValue) {
  const item = selectedMemoryItem();
  if (!item) {
    return;
  }

  item.value = nextValue;
  item.status = "active";
  item.certainty = "confirmed";
  item.last_used = "Edited in revise step";
  state.repairApplied = true;
  state.repairMethod = `edited ${item.label.toLowerCase()}`;
  appendEvent("memory_updated", { memory_id: item.id, value: nextValue, status: item.status });
  pushLog(`Memory updated: ${item.label} -> ${displayMemoryValue(item)}.`);
  render();
}

function markSelectedUncertain() {
  const item = selectedMemoryItem();
  if (!item) {
    return;
  }

  item.status = "uncertain";
  item.certainty = "inferred";
  item.last_used = "Marked uncertain during revise";
  state.repairApplied = true;
  state.repairMethod = `marked ${item.label.toLowerCase()} uncertain`;
  appendEvent("memory_marked_uncertain", { memory_id: item.id });
  pushLog(`Memory updated: ${item.label} marked uncertain.`);
  render();
}

function continueWithoutRepair() {
  state.repairApplied = true;
  state.repairMethod = "continued without repair";
  appendEvent("continued_without_repair");
  pushLog("Participant continued without changing the memory.");
  render();
}

function submitFinalDecision(decisionType) {
  const pack = getPack();
  const recommendation = currentRecommendation();
  const chosenId = decisionType === "accept" ? recommendation.id : state.selectedCandidateId;

  if (!chosenId) {
    pushLog("Select a candidate before submitting the final decision.");
    render();
    return;
  }

  state.finalDecision = chosenId;
  state.taskIndex = 3;
  const choiceLabel = pack.candidates.find((item) => item.id === chosenId)?.name || "Unknown";
  appendEvent("final_decision_submitted", { decision_type: decisionType, candidate_id: chosenId });
  pushLog(`Final decision submitted: ${choiceLabel}.`);
  render();
}

function chooseOutcomeLabel() {
  const recommendation = currentRecommendation();
  const truth = trueRecommendation();

  if (!state.chooseDecision) {
    return null;
  }
  if (state.chooseDecision === recommendation.id) {
    return state.chooseDecision === truth.id ? "appropriate reliance" : "overreliance";
  }
  return state.chooseDecision === truth.id ? "appropriate skepticism" : "wrong alternative";
}

function finalOutcomeLabel() {
  const truth = trueRecommendation();
  if (!state.finalDecision) {
    return null;
  }
  return state.finalDecision === truth.id ? "correct final decision" : "incorrect final decision";
}

function repairSuccess() {
  const pack = getPack();
  if (pack.id === "pilot_pack_01_stale_budget") {
    const budget = state.memory.find((item) => item.key === "budget_limit");
    return Boolean(budget && budget.value === 150 && budget.status === "active");
  }
  if (pack.id === "pilot_pack_02_missing_dietary_constraint") {
    const diet = state.memory.find((item) => item.key === "dietary_constraint");
    return Boolean(diet && diet.value === "vegetarian" && diet.status === "active");
  }
  const cuisine = state.memory.find((item) => item.key === "cuisine_preference");
  return Boolean(cuisine && (cuisine.value === "no_preference" || cuisine.status === "uncertain"));
}

function renderPackSelector() {
  elements.packSelect.innerHTML = PACKS.map((pack) => {
    const selected = pack.id === state.packId ? "selected" : "";
    return `<option value="${pack.id}" ${selected}>${pack.shortLabel}: ${pack.primaryError}</option>`;
  }).join("");
}

function renderGoal() {
  const pack = getPack();
  elements.goalTitle.textContent = pack.goalTitle;
  elements.goalBullets.innerHTML = pack.goalBullets.map((entry) => `<li>${entry}</li>`).join("");
  elements.scenarioNote.innerHTML = `
    <p class="card-label">Pack Note</p>
    <p class="notice-copy">${pack.studyNote}</p>
  `;
}

function renderTaskHeader() {
  const task = currentTask();
  elements.taskTitle.textContent = task.title;
  elements.taskBadge.textContent = task.badge;
  elements.instructionTitle.textContent = task.title === "Pack Complete" ? "Pack Summary" : `${task.title} Task`;
}

function renderStudyMeta() {
  const condition = getConditionConfig();
  const pack = getPack();
  elements.studyMeta.innerHTML = `
    <div class="meta-item">
      <span class="meta-key">Pack</span>
      <span class="meta-value">${pack.id}</span>
    </div>
    <div class="meta-item">
      <span class="meta-key">Primary Error</span>
      <span class="meta-value">${pack.primaryError}</span>
    </div>
    <div class="meta-item">
      <span class="meta-key">Condition</span>
      <span class="meta-value">${condition.label}</span>
    </div>
    <div class="meta-item">
      <span class="meta-key">Events</span>
      <span class="meta-value">${state.events.length}</span>
    </div>
  `;
}

function renderRecommendation() {
  const recommendation = currentRecommendation();
  const truth = trueRecommendation();
  const repaired = state.repairApplied;

  elements.recommendationName.textContent = recommendation.name;
  elements.recommendationSummary.textContent = recommendation.summary;
  elements.recommendationReasons.innerHTML = [
    `Price: ${currency(recommendation.price)} per person`,
    `Travel time: ${recommendation.distance} minutes`,
    `Vegetarian fit: ${recommendation.vegetarian ? "yes" : "no"}`,
    `Quiet setting: ${recommendation.quiet ? "yes" : "no"}`
  ].map((entry) => `<li>${entry}</li>`).join("");

  if (repaired) {
    elements.recommendationPill.textContent = recommendation.id === truth.id ? "Updated and aligned" : "Updated";
    elements.recommendationPill.className = `tag ${recommendation.id === truth.id ? "tag-active" : "tag-outdated"}`;
  } else {
    elements.recommendationPill.textContent = "Initial";
    elements.recommendationPill.className = "tag tag-outdated";
  }
}

function renderCandidates() {
  const pack = getPack();
  const recommendation = currentRecommendation();
  const truth = trueRecommendation();

  elements.candidateList.innerHTML = "";
  for (const candidate of pack.candidates) {
    const button = document.createElement("button");
    button.type = "button";
    let className = "candidate-card";
    if (candidate.id === state.selectedCandidateId) {
      className += " is-selected";
    }
    if (candidate.id === recommendation.id) {
      className += " is-recommended";
    }
    if (candidate.id === truth.id && state.taskIndex === 3) {
      className += " is-correct";
    }

    button.className = className;
    button.innerHTML = `
      <div class="candidate-topline">
        <span class="candidate-name">${candidate.name}</span>
        <span class="candidate-chip">${currency(candidate.price)}</span>
      </div>
      <p class="candidate-copy">${candidate.summary}</p>
      <ul class="detail-list">
        <li>${candidate.distance} min away</li>
        <li>${candidate.vegetarian ? "Vegetarian-friendly" : "Poor vegetarian fit"}</li>
        <li>${candidate.quiet ? "Quiet atmosphere" : "Usually lively"}</li>
      </ul>
    `;
    button.addEventListener("click", () => chooseCandidate(candidate.id));
    elements.candidateList.appendChild(button);
  }
}

function renderMemory() {
  const condition = getConditionConfig();
  elements.memoryHeading.textContent = condition.memoryVisible ? "Remembered State" : "Memory Hidden";
  elements.memoryModePill.textContent = condition.memoryVisible ? (condition.memoryEditable ? "Visible" : "Visible for inspection") : "Hidden";

  if (!condition.memoryVisible) {
    elements.memoryNotice.innerHTML = `
      <p class="card-label">Condition behavior</p>
      <p class="notice-copy">In Chat-only, remembered state is hidden. Participants can only respond to the assistant and, during revise, send a correction through natural language.</p>
    `;
    elements.memoryList.innerHTML = "";
    elements.memoryEditor.innerHTML = "";
    elements.memoryEditor.style.display = "none";
    return;
  }

  elements.memoryNotice.innerHTML = `
    <p class="card-label">Condition behavior</p>
    <p class="notice-copy">
      ${condition.impactVisible
        ? "Memory is visible and editable. Selecting an item also reveals its likely downstream effects."
        : "Memory is visible and editable, but downstream impact is not shown in this condition."}
    </p>
  `;

  elements.memoryList.innerHTML = "";
  for (const item of state.memory) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `memory-item${item.id === state.selectedMemoryId ? " is-selected" : ""}`;
    button.innerHTML = `
      <div class="memory-topline">
        <span class="memory-label">${item.label}</span>
        <span class="tag ${statusClass(item.status)}">${item.status}</span>
      </div>
      <p class="memory-copy">${displayMemoryValue(item)}</p>
      <div class="memory-bottomline">
        <span class="memory-meta">${item.certainty}</span>
        <span class="memory-meta">${item.last_used}</span>
      </div>
    `;
    button.addEventListener("click", () => {
      state.selectedMemoryId = item.id;
      appendEvent("memory_selected", { memory_id: item.id });
      render();
    });
    elements.memoryList.appendChild(button);
  }

  renderMemoryEditor();
}

function renderMemoryEditor() {
  const condition = getConditionConfig();
  const item = selectedMemoryItem();

  if (!condition.memoryVisible || !item) {
    elements.memoryEditor.style.display = "none";
    return;
  }

  elements.memoryEditor.style.display = "grid";

  if (!condition.memoryEditable) {
    elements.memoryEditor.innerHTML = `
      <p class="card-label">Memory editor</p>
      <p class="notice-copy">Editing is unavailable in this condition.</p>
    `;
    return;
  }

  if (currentTask().id !== "revise") {
    elements.memoryEditor.innerHTML = `
      <p class="card-label">Memory editor</p>
      <p class="notice-copy">Inspect items now if you want, but direct edits unlock only during the revise step.</p>
    `;
    return;
  }

  elements.memoryEditor.innerHTML = `
    <p class="card-label">Selected item</p>
    <h3>${item.label}</h3>
    <p class="notice-copy">${item.source}. Current certainty: ${item.certainty}.</p>
    <div class="editor-grid">
      <label class="control-label" for="memoryValueSelect">Value</label>
      <select id="memoryValueSelect" class="control-select">
        ${item.options.map((option) => {
          const selected = option === item.value ? "selected" : "";
          const label = item.key === "budget_limit" ? `Under ${currency(option)}` : String(option).replaceAll("_", " ");
          return `<option value="${option}" ${selected}>${label}</option>`;
        }).join("")}
      </select>
    </div>
    <div class="button-row">
      <button id="applyMemoryUpdate" class="primary-button" type="button">Apply Memory Update</button>
      <button id="markUncertain" class="secondary-button" type="button">Mark Uncertain</button>
    </div>
  `;

  elements.memoryEditor.querySelector("#applyMemoryUpdate")?.addEventListener("click", () => {
    const rawValue = elements.memoryEditor.querySelector("#memoryValueSelect")?.value;
    const nextValue = item.key === "budget_limit" || item.key === "distance_limit" ? Number(rawValue) : rawValue;
    updateMemoryItem(nextValue);
  });

  elements.memoryEditor.querySelector("#markUncertain")?.addEventListener("click", markSelectedUncertain);
}

function renderTimeline() {
  elements.timeline.innerHTML = "";
  TASKS.slice(0, 3).forEach((task, index) => {
    let className = "timeline-step";
    if (index < state.taskIndex) {
      className += " is-complete";
    } else if (index === state.taskIndex) {
      className += " is-active";
    }

    const block = document.createElement("div");
    block.className = className;
    block.innerHTML = `
      <p class="card-label">${task.title}</p>
      <p class="instruction-copy">${index === 0 ? "Make an initial decision." : index === 1 ? "Judge alignment." : "Repair memory and make a final decision."}</p>
    `;
    elements.timeline.appendChild(block);
  });
}

function renderInstructionCard() {
  const task = currentTask().id;
  const condition = getConditionConfig();

  const copyByTask = {
    choose: `
      <p class="card-label">Task prompt</p>
      <p class="instruction-copy">Review the assistant's recommendation and decide whether to accept it or choose another candidate.</p>
    `,
    audit: `
      <p class="card-label">Task prompt</p>
      <p class="instruction-copy">Judge whether the current recommendation is aligned with the user's real needs, not just the assistant's remembered state.</p>
    `,
    revise: `
      <p class="card-label">Task prompt</p>
      <p class="instruction-copy">
        The remembered state may be wrong, stale, or overly confident. ${
          condition.memoryEditable
            ? "Inspect and repair the memory if needed, then decide again."
            : "Send a natural-language correction to the assistant, then decide again."
        }
      </p>
    `,
    complete: `
      <p class="card-label">Pack summary</p>
      <p class="instruction-copy">This pack is complete. Review the outcome signals below, export the event log if needed, then reset or switch packs.</p>
    `
  };

  elements.instructionCard.innerHTML = copyByTask[task];
}

function renderActionArea() {
  const task = currentTask().id;
  const condition = getConditionConfig();
  const recommendation = currentRecommendation();

  if (task === "choose") {
    elements.actionArea.innerHTML = `
      <button id="acceptInitial" class="primary-button" type="button">Accept "${recommendation.name}"</button>
      <button id="submitAlternative" class="secondary-button" type="button">Submit Selected Alternative</button>
    `;
    elements.actionArea.querySelector("#acceptInitial")?.addEventListener("click", () => submitChoose("accept"));
    elements.actionArea.querySelector("#submitAlternative")?.addEventListener("click", () => submitChoose("selected"));
    return;
  }

  if (task === "audit") {
    elements.actionArea.innerHTML = `
      <div class="radio-row">
        <button id="auditAligned" class="primary-button" type="button">Aligned with user needs</button>
        <button id="auditNotAligned" class="secondary-button" type="button">Not aligned</button>
      </div>
    `;
    elements.actionArea.querySelector("#auditAligned")?.addEventListener("click", () => submitAudit("aligned"));
    elements.actionArea.querySelector("#auditNotAligned")?.addEventListener("click", () => submitAudit("not aligned"));
    return;
  }

  if (task === "revise") {
    if (!condition.memoryEditable) {
      elements.actionArea.innerHTML = `
        <label class="control-label" for="chatCorrectionInput">Send a correction message</label>
        <textarea id="chatCorrectionInput" class="control-textarea" placeholder="Describe what the assistant remembered incorrectly."></textarea>
        <div class="button-row">
          <button id="applyChatCorrection" class="primary-button" type="button">Apply Chat Correction</button>
          <button id="skipRepair" class="secondary-button" type="button">Continue Without Repair</button>
        </div>
        ${state.repairApplied ? `
          <div class="notice-card">
            <p class="card-label">Repair status</p>
            <p class="notice-copy">${state.repairMethod}</p>
          </div>
          <div class="button-row">
            <button id="acceptFinal" class="primary-button" type="button">Accept "${recommendation.name}"</button>
            <button id="submitFinalAlternative" class="secondary-button" type="button">Submit Selected Final Option</button>
          </div>
        ` : ""}
      `;
      elements.actionArea.querySelector("#applyChatCorrection")?.addEventListener("click", applyChatCorrection);
      elements.actionArea.querySelector("#skipRepair")?.addEventListener("click", continueWithoutRepair);
      elements.actionArea.querySelector("#acceptFinal")?.addEventListener("click", () => submitFinalDecision("accept"));
      elements.actionArea.querySelector("#submitFinalAlternative")?.addEventListener("click", () => submitFinalDecision("selected"));
      return;
    }

    elements.actionArea.innerHTML = `
      <div class="notice-card">
        <p class="card-label">Revise instruction</p>
        <p class="notice-copy">Select a memory item in the workspace, apply an edit if needed, then submit a final decision. The assistant recommendation updates automatically after each edit.</p>
      </div>
      <div class="button-row">
        <button id="skipEditableRepair" class="secondary-button" type="button">Continue Without Repair</button>
      </div>
      ${state.repairApplied ? `
        <div class="notice-card">
          <p class="card-label">Repair status</p>
          <p class="notice-copy">${state.repairMethod}</p>
        </div>
      ` : ""}
      <div class="button-row">
        <button id="acceptFinalEditable" class="primary-button" type="button">Accept "${recommendation.name}"</button>
        <button id="submitFinalEditableAlternative" class="secondary-button" type="button">Submit Selected Final Option</button>
      </div>
    `;
    elements.actionArea.querySelector("#skipEditableRepair")?.addEventListener("click", continueWithoutRepair);
    elements.actionArea.querySelector("#acceptFinalEditable")?.addEventListener("click", () => submitFinalDecision("accept"));
    elements.actionArea.querySelector("#submitFinalEditableAlternative")?.addEventListener("click", () => submitFinalDecision("selected"));
    return;
  }

  elements.actionArea.innerHTML = `
    <div class="notice-card">
      <p class="card-label">Summary</p>
      <ul class="detail-list">
        <li>Initial outcome: ${chooseOutcomeLabel() || "not available"}</li>
        <li>Audit answer: ${state.auditAnswer || "not available"}</li>
        <li>Repair successful: ${repairSuccess() ? "yes" : "no"}</li>
        <li>Final outcome: ${finalOutcomeLabel() || "not available"}</li>
      </ul>
      <div class="button-row">
        <button id="resetFromSummary" class="primary-button" type="button">Run Pack Again</button>
      </div>
    </div>
  `;
  elements.actionArea.querySelector("#resetFromSummary")?.addEventListener("click", resetScenario);
}

function renderImpactPanel() {
  const condition = getConditionConfig();
  const item = selectedMemoryItem();

  if (!condition.impactVisible) {
    elements.impactPanel.className = "impact-empty";
    elements.impactPanel.innerHTML = `
      <p class="empty-state">Impact preview is unavailable in ${condition.label}. This helps isolate the value of direct memory editing from downstream impact visibility.</p>
    `;
    return;
  }

  if (!item) {
    elements.impactPanel.className = "impact-empty";
    elements.impactPanel.innerHTML = `<p class="empty-state">Select a memory item to inspect its recent use and likely downstream effects.</p>`;
    return;
  }

  elements.impactPanel.className = "impact-card";
  elements.impactPanel.innerHTML = `
    <div class="impact-block">
      <p class="card-label">Selected item</p>
      <p class="instruction-copy">${item.label}: ${displayMemoryValue(item)}</p>
    </div>
    <div class="impact-block">
      <p class="card-label">State</p>
      <p class="instruction-copy">${item.impact.state}</p>
    </div>
    <div class="impact-block">
      <p class="card-label">Used in</p>
      <ul class="impact-list">
        ${item.impact.usedIn.map((entry) => `<li>${entry}</li>`).join("")}
      </ul>
    </div>
    <div class="impact-block">
      <p class="card-label">Likely affects</p>
      <ul class="impact-list">
        ${item.impact.likelyAffects.map((entry) => `<li>${entry}</li>`).join("")}
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

function renderLog() {
  const latestEvents = state.events.slice(-5).reverse();
  elements.activityLog.innerHTML = `
    <ul class="log-list">
      ${state.log.map((entry) => `<li>${entry}</li>`).join("")}
    </ul>
    <div class="panel-subheader">
      <p class="panel-kicker">Recent Events</p>
      <p class="subtle-copy">${state.events.length} captured so far</p>
    </div>
    <ul class="log-list">
      ${latestEvents.map((event) => `<li>${event.action} · ${event.task}</li>`).join("")}
    </ul>
  `;
}

function exportEventLog() {
  const payload = {
    pack_id: state.packId,
    condition: state.condition,
    events: state.events
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.packId}_${state.condition}_event_log.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  appendEvent("event_log_exported", { event_count: state.events.length });
  pushLog("Event log exported.");
  render();
}

function render() {
  renderPackSelector();
  renderStudyMeta();
  renderGoal();
  renderTaskHeader();
  renderRecommendation();
  renderCandidates();
  renderMemory();
  renderTimeline();
  renderInstructionCard();
  renderActionArea();
  renderImpactPanel();
  renderLog();

  elements.packSelect.value = state.packId;
  elements.conditionSelect.value = state.condition;
}

elements.packSelect.addEventListener("change", (event) => {
  setPack(event.target.value);
});

elements.conditionSelect.addEventListener("change", (event) => {
  setCondition(event.target.value);
});

elements.resetPack.addEventListener("click", resetScenario);
elements.exportLog.addEventListener("click", exportEventLog);

rebuildPack(PACKS[0].id);
appendEvent("prototype_loaded");
render();
