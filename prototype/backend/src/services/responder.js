import { TASK_KINDS } from "../domain/constants.js";
import { generateOpenAiTaskResponse } from "./openai-responder.js";
import { getResponderConfig } from "./responder-config.js";

function activeItems(memory, type) {
  return memory.filter((item) => item.type === type && item.status !== "removed");
}

function firstValue(memory, predicate) {
  return memory.find(predicate) || null;
}

function buildUsageTrace(items) {
  return items.map((item) => item.id);
}

function makeLaunchReplanResponse(task, memory) {
  const deadline = firstValue(memory, (item) => item.type === "deadline" && item.entity_ref === "launch");
  const announceOwner = firstValue(memory, (item) => item.type === "owner" && item.entity_ref === "task_announce");
  const bugConstraint = firstValue(memory, (item) => item.type === "constraint" && item.entity_ref === "launch");
  const dependencies = activeItems(memory, "dependency");
  const openIssues = activeItems(memory, "open_issue").filter((item) => item.status !== "resolved");

  const mustDelay = Boolean(
    bugConstraint ||
      openIssues.some((item) => String(item.value).includes("legal_turnaround_uncertain")) ||
      (deadline && String(deadline.value).includes("plus_2_days"))
  );

  const steps = [
    `Announcement owner: ${announceOwner ? announceOwner.value : "unknown"}.`,
    `Dependencies: ${dependencies.length ? dependencies.map((item) => item.value || item.depends_on).join(", ") : "none recorded"}.`,
    `Launch timing: ${mustDelay ? "delay the launch and recheck blockers" : `keep ${deadline ? deadline.value : "current target"}`}.`
  ];

  return {
    task_id: task.id,
    task_kind: task.kind,
    summary: mustDelay
      ? "Do not keep the original launch plan. Resolve blockers first, then reschedule."
      : "Current memory does not indicate a required delay.",
    bullets: steps,
    finding_tags: [
      ...(dependencies.some((item) => item.value === "legal_approval" || item.depends_on === "legal_approval")
        ? ["legal_dependency"]
        : []),
      ...(bugConstraint ? ["critical_bug_blocker"] : []),
      ...(mustDelay ? ["launch_delay"] : []),
      ...(announceOwner ? ["announcement_owner_known"] : [])
    ],
    decisions: {
      launch_should_proceed: !mustDelay,
      delay_required: mustDelay,
      announcement_owner: announceOwner ? announceOwner.value : ""
    },
    usage_trace: buildUsageTrace([deadline, announceOwner, bugConstraint, ...dependencies, ...openIssues].filter(Boolean)),
    response_source: "deterministic",
    provider: "local",
    model: "deterministic-v1",
    fallback_used: false,
    raw_usage: null
  };
}

function makeResearchReplanResponse(task, memory) {
  const deadline = firstValue(memory, (item) => item.type === "deadline" && item.entity_ref === "pilot");
  const materialsOwner = firstValue(memory, (item) => item.type === "owner" && item.entity_ref === "task_materials");
  const ethicsDependency = firstValue(memory, (item) => item.type === "dependency" && item.value === "ethics_approval");
  const recruitmentConstraint = firstValue(
    memory,
    (item) => item.type === "constraint" && item.value === "ethics_before_recruitment"
  );
  const openIssues = activeItems(memory, "open_issue").filter((item) => item.status !== "resolved");
  const mustDelay = Boolean(
    ethicsDependency &&
      (deadline?.value === "three_weeks" || openIssues.some((item) => ["budget_undecided", "channel_undecided"].includes(item.value)))
  );

  return {
    task_id: task.id,
    task_kind: task.kind,
    summary: mustDelay
      ? "Do not keep the next-week pilot target. Resolve approval and planning blockers first."
      : "Current memory does not require a pilot delay.",
    bullets: [
      `Materials owner: ${materialsOwner ? materialsOwner.value : "unknown"}.`,
      `Pilot dependency: ${ethicsDependency ? ethicsDependency.value : "none recorded"}.`,
      `Recruitment constraint: ${recruitmentConstraint ? recruitmentConstraint.value : "none recorded"}.`,
      `Pilot timing: ${mustDelay ? "delay the pilot and update the plan" : deadline ? deadline.value : "untracked"}.`
    ],
    finding_tags: [
      ...(materialsOwner ? ["materials_owner_known"] : []),
      ...(ethicsDependency ? ["ethics_dependency"] : []),
      ...(openIssues.some((item) => item.value === "budget_undecided") ? ["budget_issue"] : []),
      ...(openIssues.some((item) => item.value === "channel_undecided") ? ["channel_issue"] : []),
      ...(mustDelay ? ["pilot_delay"] : [])
    ],
    decisions: {
      pilot_should_start_next_week: !mustDelay,
      delay_required: mustDelay,
      materials_owner: materialsOwner ? materialsOwner.value : ""
    },
    usage_trace: buildUsageTrace(
      [deadline, materialsOwner, ethicsDependency, recruitmentConstraint, ...openIssues].filter(Boolean)
    ),
    response_source: "deterministic",
    provider: "local",
    model: "deterministic-v1",
    fallback_used: false,
    raw_usage: null
  };
}

function makeOutageReplanResponse(task, memory) {
  const hotfixOwner = firstValue(memory, (item) => item.type === "owner" && item.entity_ref === "task_hotfix");
  const qaDependency = firstValue(memory, (item) => item.type === "dependency" && item.value === "qa_signoff");
  const announcementConstraint = firstValue(
    memory,
    (item) => item.type === "constraint" && item.value === "product_review_first"
  );
  const compensationIssue = firstValue(
    memory,
    (item) => item.type === "open_issue" && item.entity_ref === "compensation" && item.status !== "resolved"
  );
  const mustHold = Boolean(qaDependency || compensationIssue);

  return {
    task_id: task.id,
    task_kind: task.kind,
    summary: mustHold
      ? "Do not restore full traffic yet. Complete QA validation and keep external comms gated."
      : "Current memory does not indicate a restoration block.",
    bullets: [
      `Hotfix owner: ${hotfixOwner ? hotfixOwner.value : "unknown"}.`,
      `Traffic restore dependency: ${qaDependency ? qaDependency.value : "none recorded"}.`,
      `Announcement rule: ${announcementConstraint ? announcementConstraint.value : "none recorded"}.`,
      `Restoration timing: ${mustHold ? "wait for QA signoff before full restore" : "restore when ready"}.`
    ],
    finding_tags: [
      ...(hotfixOwner ? ["hotfix_owner_known"] : []),
      ...(qaDependency ? ["qa_blocker"] : []),
      ...(announcementConstraint ? ["announcement_constraint"] : []),
      ...(compensationIssue ? ["compensation_uncertainty"] : []),
      ...(mustHold ? ["restore_hold"] : [])
    ],
    decisions: {
      full_restore_now: !mustHold,
      hold_restore: mustHold,
      hotfix_owner: hotfixOwner ? hotfixOwner.value : ""
    },
    usage_trace: buildUsageTrace([hotfixOwner, qaDependency, announcementConstraint, compensationIssue].filter(Boolean)),
    response_source: "deterministic",
    provider: "local",
    model: "deterministic-v1",
    fallback_used: false,
    raw_usage: null
  };
}

function makeRiskAnalysisResponse(task, memory, session) {
  const risks = [];
  const usage = [];

  for (const item of memory) {
    if (item.status === "removed") {
      continue;
    }

    if (item.type === "constraint") {
      risks.push(`Blocker: ${item.content}`);
      usage.push(item);
    }

    if (item.type === "dependency") {
      risks.push(`Dependency risk: ${item.content}`);
      usage.push(item);
    }

    if (item.type === "deadline" && item.status === "uncertain") {
      risks.push(`Schedule risk: ${item.content}`);
      usage.push(item);
    }

    if (item.type === "open_issue" && item.status !== "resolved") {
      risks.push(`Unresolved issue: ${item.content}`);
      usage.push(item);
    }
  }

  if (session.scenario_id === "outage" && risks.length && !risks.some((item) => item.includes("QA"))) {
    const qaDependency = firstValue(memory, (item) => item.type === "dependency" && item.value === "qa_signoff");
    if (qaDependency) {
      risks.push(`Blocker: ${qaDependency.content}`);
      usage.push(qaDependency);
    }
  }

  return {
    task_id: task.id,
    task_kind: task.kind,
    summary: risks.length ? "Current memory indicates active blockers and unresolved issues." : "No risks recorded.",
    bullets: risks,
    finding_tags: [
      ...(memory.some((item) => item.type === "dependency" && item.value === "legal_approval") ? ["legal_dependency"] : []),
      ...(memory.some((item) => item.type === "constraint" && item.entity_ref === "launch") ? ["critical_bug_blocker"] : []),
      ...(memory.some((item) => item.type === "open_issue" && item.value === "legal_turnaround_uncertain")
        ? ["legal_timing_risk"]
        : []),
      ...(memory.some((item) => item.type === "dependency" && item.value === "ethics_approval") ? ["ethics_dependency"] : []),
      ...(memory.some((item) => item.type === "open_issue" && item.value === "budget_undecided") ? ["budget_issue"] : []),
      ...(memory.some((item) => item.type === "open_issue" && item.value === "channel_undecided") ? ["channel_issue"] : []),
      ...(memory.some((item) => item.type === "dependency" && item.value === "qa_signoff") ? ["qa_blocker"] : []),
      ...(memory.some((item) => item.type === "constraint" && item.value === "product_review_first")
        ? ["announcement_constraint"]
        : []),
      ...(memory.some((item) => item.type === "open_issue" && item.entity_ref === "compensation" && item.status !== "resolved")
        ? ["compensation_uncertainty"]
        : [])
    ],
    decisions: {
      blocker_count: risks.filter((item) => item.startsWith("Blocker")).length,
      unresolved_issue_count: risks.filter((item) => item.startsWith("Unresolved issue")).length
    },
    usage_trace: buildUsageTrace(usage),
    response_source: "deterministic",
    provider: "local",
    model: "deterministic-v1",
    fallback_used: false,
    raw_usage: null
  };
}

function makeLaunchDecisionAuditResponse(task, memory) {
  const dependencies = activeItems(memory, "dependency");
  const bugConstraint = firstValue(memory, (item) => item.type === "constraint" && item.entity_ref === "launch");
  const deadline = firstValue(memory, (item) => item.type === "deadline" && item.entity_ref === "launch");
  const unresolvedLegalIssue = activeItems(memory, "open_issue").some((item) =>
    String(item.value).includes("legal_turnaround_uncertain")
  );

  const publishThisWeekAllowed = dependencies.length === 0 && !unresolvedLegalIssue;
  const launchOriginalDateAllowed =
    !bugConstraint && !unresolvedLegalIssue && !(deadline && String(deadline.value).includes("plus_2_days"));

  return {
    task_id: task.id,
    task_kind: task.kind,
    summary: "The audit checks whether the proposed actions remain consistent with the meeting memory.",
    bullets: [
      `Publish this week: ${publishThisWeekAllowed ? "consistent" : "not consistent"}.`,
      `Launch on original date: ${launchOriginalDateAllowed ? "consistent" : "not consistent"}.`
    ],
    finding_tags: [
      ...(dependencies.some((item) => item.value === "legal_approval" || item.depends_on === "legal_approval")
        ? ["legal_dependency"]
        : []),
      ...(bugConstraint ? ["critical_bug_blocker"] : []),
      ...(!launchOriginalDateAllowed ? ["launch_delay"] : [])
    ],
    decisions: {
      publish_this_week: publishThisWeekAllowed,
      launch_on_original_date: launchOriginalDateAllowed
    },
    usage_trace: buildUsageTrace([bugConstraint, deadline, ...dependencies].filter(Boolean)),
    response_source: "deterministic",
    provider: "local",
    model: "deterministic-v1",
    fallback_used: false,
    raw_usage: null
  };
}

function makeResearchDecisionAuditResponse(task, memory) {
  const ethicsDependency = firstValue(memory, (item) => item.type === "dependency" && item.value === "ethics_approval");
  const recruitmentConstraint = firstValue(
    memory,
    (item) => item.type === "constraint" && item.value === "ethics_before_recruitment"
  );
  const deadline = firstValue(memory, (item) => item.type === "deadline" && item.entity_ref === "pilot");
  const budgetIssue = firstValue(memory, (item) => item.type === "open_issue" && item.value === "budget_undecided");

  return {
    task_id: task.id,
    task_kind: task.kind,
    summary: "The audit checks whether recruitment and pilot timing still match the meeting memory.",
    bullets: [
      `Start recruitment now: ${ethicsDependency || recruitmentConstraint ? "not consistent" : "consistent"}.`,
      `Run the pilot next week: ${deadline?.value === "one_week" && !budgetIssue ? "consistent" : "not consistent"}.`
    ],
    finding_tags: [
      ...(ethicsDependency ? ["ethics_dependency"] : []),
      ...(budgetIssue ? ["budget_issue"] : []),
      ...(!(deadline?.value === "one_week" && !budgetIssue) ? ["pilot_delay"] : [])
    ],
    decisions: {
      recruit_now: !(ethicsDependency || recruitmentConstraint),
      pilot_next_week: deadline?.value === "one_week" && !budgetIssue
    },
    usage_trace: buildUsageTrace([ethicsDependency, recruitmentConstraint, deadline, budgetIssue].filter(Boolean)),
    response_source: "deterministic",
    provider: "local",
    model: "deterministic-v1",
    fallback_used: false,
    raw_usage: null
  };
}

function makeOutageDecisionAuditResponse(task, memory) {
  const qaDependency = firstValue(memory, (item) => item.type === "dependency" && item.value === "qa_signoff");
  const announcementConstraint = firstValue(
    memory,
    (item) => item.type === "constraint" && item.value === "product_review_first"
  );
  const compensationIssue = firstValue(
    memory,
    (item) => item.type === "open_issue" && item.entity_ref === "compensation" && item.status !== "resolved"
  );

  return {
    task_id: task.id,
    task_kind: task.kind,
    summary: "The audit checks whether restoration and user communication are consistent with the meeting memory.",
    bullets: [
      `Restore full traffic now: ${qaDependency ? "not consistent" : "consistent"}.`,
      `Send compensation notice to all users now: ${compensationIssue || announcementConstraint ? "not consistent" : "consistent"}.`
    ],
    finding_tags: [
      ...(qaDependency ? ["qa_blocker"] : []),
      ...(announcementConstraint ? ["announcement_constraint"] : []),
      ...(compensationIssue ? ["compensation_uncertainty"] : []),
      ...(qaDependency || compensationIssue ? ["restore_hold"] : [])
    ],
    decisions: {
      restore_full_traffic_now: !qaDependency,
      announce_compensation_now: !(compensationIssue || announcementConstraint)
    },
    usage_trace: buildUsageTrace([qaDependency, announcementConstraint, compensationIssue].filter(Boolean)),
    response_source: "deterministic",
    provider: "local",
    model: "deterministic-v1",
    fallback_used: false,
    raw_usage: null
  };
}

export function generateDeterministicTaskResponse(task, session) {
  if (task.kind === TASK_KINDS.REPLAN) {
    if (session.scenario_id === "research") {
      return makeResearchReplanResponse(task, session.active_memory);
    }

    if (session.scenario_id === "outage") {
      return makeOutageReplanResponse(task, session.active_memory);
    }

    return makeLaunchReplanResponse(task, session.active_memory);
  }

  if (task.kind === TASK_KINDS.RISK_ANALYSIS) {
    return makeRiskAnalysisResponse(task, session.active_memory, session);
  }

  if (task.kind === TASK_KINDS.DECISION_AUDIT) {
    if (session.scenario_id === "research") {
      return makeResearchDecisionAuditResponse(task, session.active_memory);
    }

    if (session.scenario_id === "outage") {
      return makeOutageDecisionAuditResponse(task, session.active_memory);
    }

    return makeLaunchDecisionAuditResponse(task, session.active_memory);
  }

  throw new Error(`Unsupported task kind: ${task.kind}`);
}

export async function generateTaskResponse(task, session, options = {}) {
  const config = getResponderConfig();

  if (config.effectiveMode === "openai_unavailable") {
    throw new Error("MMG_RESPONDER_MODE is set to openai, but OPENAI_API_KEY is not configured.");
  }

  if (config.effectiveMode === "openai") {
    try {
      return await generateOpenAiTaskResponse(task, session, options);
    } catch (error) {
      if (config.requestedMode === "openai") {
        throw error;
      }

      const fallback = generateDeterministicTaskResponse(task, session);
      return {
        ...fallback,
        fallback_used: true,
        fallback_reason: error.message
      };
    }
  }

  return generateDeterministicTaskResponse(task, session);
}
