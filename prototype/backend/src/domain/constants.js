export const CONDITIONS = Object.freeze({
  HIDDEN: "Hidden",
  VISIBLE_READONLY: "Visible-Readonly",
  VISIBLE_EDITABLE: "Visible-Editable"
});

export const MEMORY_TYPES = Object.freeze([
  "task",
  "owner",
  "deadline",
  "dependency",
  "constraint",
  "open_issue"
]);

export const TASK_KINDS = Object.freeze({
  REPLAN: "replan",
  RISK_ANALYSIS: "risk_analysis",
  DECISION_AUDIT: "decision_audit"
});
