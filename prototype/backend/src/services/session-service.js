import { appendEvent } from "./event-log.js";
import { getPermissions } from "../domain/permissions.js";

let sessionCounter = 0;
let memoryCounter = 0;

function nextSessionId() {
  sessionCounter += 1;
  return `sess_${String(sessionCounter).padStart(3, "0")}`;
}

function nextMemoryId() {
  memoryCounter += 1;
  return `mem_user_${String(memoryCounter).padStart(4, "0")}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeConflictItems(updates) {
  return updates.map((update) => ({
    id: `conf_${update.id}`,
    update_id: update.id,
    target_memory_id: update.target_memory_id,
    impact_tags: update.impact_tags || [],
    reason: update.reason
  }));
}

function findMemoryIndex(memory, memoryId) {
  return memory.findIndex((item) => item.id === memoryId);
}

export function createSession({ participantId, condition, scenario }) {
  const session = {
    session_id: nextSessionId(),
    participant_id: participantId,
    condition,
    permissions: getPermissions(condition),
    scenario_id: scenario.scenario_id,
    step: "transcript_review",
    transcript: clone(scenario.transcript),
    active_memory: clone(scenario.seed_active_memory),
    proposed_updates: clone(scenario.proposed_updates),
    conflict_queue: [],
    current_conflict_round: null,
    task_responses: [],
    event_log: [],
    applied_conflict_rounds: []
  };

  appendEvent(session, "session_created", {
    participant_id: participantId,
    condition,
    scenario_id: scenario.scenario_id
  });

  return session;
}

export function applyConflictRound(session, round) {
  session.step = "conflict_review";
  session.proposed_updates = clone(round.updates);
  session.conflict_queue = makeConflictItems(round.updates);
  session.current_conflict_round = clone(round);
  session.applied_conflict_rounds.push(round.id);

  appendEvent(session, "conflict_round_applied", {
    round_id: round.id,
    label: round.label,
    proposed_update_ids: round.updates.map((item) => item.id)
  });
}

export function acceptUpdate(session, updateId, actor = "participant") {
  if (!session.permissions.canEditMemory) {
    throw new Error("Current condition does not allow memory edits.");
  }

  const updateIndex = session.proposed_updates.findIndex((item) => item.id === updateId);
  if (updateIndex === -1) {
    throw new Error(`Unknown proposed update: ${updateId}`);
  }

  const update = session.proposed_updates[updateIndex];
  const item = clone(update.proposed_item);
  item.updated_by = actor;
  item.updated_at = new Date().toISOString();

  if (update.action === "add") {
    session.active_memory.push(item);
  } else if (update.action === "update") {
    const targetIndex = findMemoryIndex(session.active_memory, update.target_memory_id);
    if (targetIndex === -1) {
      session.active_memory.push(item);
    } else {
      session.active_memory[targetIndex] = item;
    }
  } else if (update.action === "remove") {
    const targetIndex = findMemoryIndex(session.active_memory, update.target_memory_id);
    if (targetIndex !== -1) {
      session.active_memory[targetIndex].status = "removed";
      session.active_memory[targetIndex].updated_by = actor;
      session.active_memory[targetIndex].updated_at = new Date().toISOString();
    }
  }

  session.proposed_updates.splice(updateIndex, 1);
  session.conflict_queue = session.conflict_queue.filter((item) => item.update_id !== updateId);

  appendEvent(session, "update_accepted", {
    update_id: updateId,
    action: update.action,
    actor
  });
}

export function rejectUpdate(session, updateId, actor = "participant") {
  if (!session.permissions.canEditMemory) {
    throw new Error("Current condition does not allow memory edits.");
  }

  const updateIndex = session.proposed_updates.findIndex((item) => item.id === updateId);
  if (updateIndex === -1) {
    throw new Error(`Unknown proposed update: ${updateId}`);
  }

  session.proposed_updates.splice(updateIndex, 1);
  session.conflict_queue = session.conflict_queue.filter((item) => item.update_id !== updateId);

  appendEvent(session, "update_rejected", {
    update_id: updateId,
    actor
  });
}

export function editMemoryItem(session, memoryId, patch, actor = "participant") {
  if (!session.permissions.canEditMemory) {
    throw new Error("Current condition does not allow memory edits.");
  }

  const targetIndex = findMemoryIndex(session.active_memory, memoryId);
  if (targetIndex === -1) {
    throw new Error(`Unknown memory item: ${memoryId}`);
  }

  const before = clone(session.active_memory[targetIndex]);
  const after = {
    ...session.active_memory[targetIndex],
    ...patch,
    updated_by: actor,
    updated_at: new Date().toISOString()
  };

  session.active_memory[targetIndex] = after;

  appendEvent(session, "memory_item_edited", {
    memory_id: memoryId,
    actor,
    before,
    after
  });
}

export function addMemoryItem(session, item, actor = "participant") {
  if (!session.permissions.canEditMemory) {
    throw new Error("Current condition does not allow memory edits.");
  }

  const nextItem = {
    id: item.id || nextMemoryId(),
    ...clone(item),
    created_by: actor,
    updated_by: actor,
    updated_at: new Date().toISOString()
  };

  session.active_memory.push(nextItem);

  appendEvent(session, "memory_item_added", {
    memory_id: nextItem.id,
    actor
  });
}

export function markMemoryUncertain(session, memoryId, actor = "participant") {
  editMemoryItem(session, memoryId, { status: "uncertain" }, actor);
}

export function removeMemoryItem(session, memoryId, actor = "participant") {
  editMemoryItem(session, memoryId, { status: "removed" }, actor);
}

export function recordTaskResponse(session, response) {
  session.step = `task_${response.task_id}`;
  session.task_responses.push(response);

  appendEvent(session, "task_response_recorded", {
    task_id: response.task_id,
    task_kind: response.task_kind,
    usage_trace: response.usage_trace,
    response_source: response.response_source || "deterministic",
    model: response.model || "deterministic-v1",
    fallback_used: Boolean(response.fallback_used)
  });
}
