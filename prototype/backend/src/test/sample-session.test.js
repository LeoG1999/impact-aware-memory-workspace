import test from "node:test";
import assert from "node:assert/strict";

import { CONDITIONS } from "../domain/constants.js";
import { loadScenarioBundle } from "../services/scenario-loader.js";
import {
  acceptUpdate,
  applyConflictRound,
  createSession,
  recordTaskResponse
} from "../services/session-service.js";
import { generateTaskResponse } from "../services/responder.js";
import { scoreSession } from "../services/scoring.js";

test("sample launch session reaches the corrected state and passes rubric checks", async () => {
  const scenario = loadScenarioBundle("launch");
  const session = createSession({
    participantId: "test_user_01",
    condition: CONDITIONS.VISIBLE_EDITABLE,
    scenario
  });

  applyConflictRound(session, scenario.conflicts[0]);

  for (const update of [...session.proposed_updates]) {
    acceptUpdate(session, update.id, "test_runner");
  }

  for (const task of scenario.tasks) {
    recordTaskResponse(session, await generateTaskResponse(task, session, { language: "en" }));
  }

  const score = scoreSession(session, scenario.scoring_rubric);
  const announceOwner = session.active_memory.find((item) => item.id === "mem_owner_announce");
  const dependency = session.active_memory.find((item) => item.id === "mem_dependency_announce");

  assert.equal(announceOwner?.value, "marketing_lead");
  assert.equal(dependency?.value, "legal_approval");
  assert.equal(session.task_responses.length, 3);
  assert.equal(score.passed_rules, score.total_rules);
});
