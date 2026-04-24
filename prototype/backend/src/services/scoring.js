function findTaskResponse(session, taskId) {
  return session.task_responses.find((item) => item.task_id === taskId) || null;
}

function hasFindingTag(response, tag) {
  return Boolean(response?.finding_tags?.includes(tag));
}

function hasMemory(session, predicate) {
  return session.active_memory.some((item) => item.status !== "removed" && predicate(item));
}

function scoreRule(rule, session) {
  const response = findTaskResponse(session, rule.task_id);

  switch (rule.criterion_id) {
    case "keep_legal_dependency":
      return hasMemory(
        session,
        (item) => item.type === "dependency" && (item.value === "legal_approval" || item.depends_on === "legal_approval")
      );
    case "delay_launch":
      return Boolean(response?.decisions?.delay_required);
    case "identify_bug_blocker":
      return hasFindingTag(response, "critical_bug_blocker") ||
        Boolean(response?.bullets?.some((item) => item.includes("critical bug") || item.includes("cannot happen")));
    case "identify_legal_timing":
      return hasFindingTag(response, "legal_timing_risk") ||
        Boolean(response?.bullets?.some((item) => item.includes("Legal turnaround") || item.includes("legal")));
    case "reject_original_plan":
      return response
        ? response.decisions.publish_this_week === false && response.decisions.launch_on_original_date === false
        : false;
    case "keep_ethics_dependency":
      return hasMemory(session, (item) => item.type === "dependency" && item.value === "ethics_approval");
    case "delay_pilot":
      return Boolean(response?.decisions?.delay_required);
    case "identify_ethics_blocker":
      return hasFindingTag(response, "ethics_dependency") ||
        Boolean(response?.bullets?.some((item) => item.toLowerCase().includes("ethics")));
    case "identify_budget_or_channel_issue":
      return hasFindingTag(response, "budget_issue") ||
        hasFindingTag(response, "channel_issue") ||
        Boolean(
        response?.bullets?.some(
          (item) => item.toLowerCase().includes("budget") || item.toLowerCase().includes("channel")
        )
      );
    case "reject_early_recruitment":
      return response ? response.decisions.recruit_now === false && response.decisions.pilot_next_week === false : false;
    case "keep_qa_dependency":
      return hasMemory(session, (item) => item.type === "dependency" && item.value === "qa_signoff");
    case "respect_announcement_constraint":
      return hasMemory(session, (item) => item.type === "constraint" && item.value === "product_review_first");
    case "identify_qa_blocker":
      return hasFindingTag(response, "qa_blocker") ||
        Boolean(response?.bullets?.some((item) => item.toLowerCase().includes("qa")));
    case "identify_compensation_uncertainty":
      return hasFindingTag(response, "compensation_uncertainty") ||
        Boolean(response?.bullets?.some((item) => item.toLowerCase().includes("compensation")));
    case "reject_premature_restore":
      return response
        ? response.decisions.restore_full_traffic_now === false &&
            response.decisions.announce_compensation_now === false
        : false;
    default:
      return false;
  }
}

export function scoreSession(session, rubric) {
  const results = rubric.map((rule) => ({
    ...rule,
    passed: scoreRule(rule, session)
  }));

  const passed = results.filter((item) => item.passed).length;

  return {
    total_rules: results.length,
    passed_rules: passed,
    score_ratio: results.length ? passed / results.length : 0,
    results
  };
}
