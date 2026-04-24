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

for (const scenarioId of ["launch", "research", "outage"]) {
  test(`${scenarioId} scenario passes rubric after applying all proposed fixes`, async () => {
    const scenario = loadScenarioBundle(scenarioId);
    const session = createSession({
      participantId: `test_${scenarioId}`,
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
    assert.equal(score.passed_rules, score.total_rules);
  });
}
