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

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function printMemory(memory) {
  for (const item of memory) {
    console.log(`- ${item.id} | ${item.type} | ${item.status} | ${item.content}`);
  }
}

function printResponse(response) {
  console.log(response.summary);
  for (const bullet of response.bullets) {
    console.log(`  * ${bullet}`);
  }
  console.log(`  usage_trace: ${response.usage_trace.join(", ")}`);
}

const scenario = loadScenarioBundle("launch");
const session = createSession({
  participantId: "pilot_user_01",
  condition: CONDITIONS.VISIBLE_EDITABLE,
  scenario
});

async function main() {
  printSection("Session Created");
  console.log(`session_id: ${session.session_id}`);
  console.log(`condition: ${session.condition}`);
  console.log(`scenario: ${session.scenario_id}`);

  printSection("Seed Active Memory");
  printMemory(session.active_memory);

  applyConflictRound(session, scenario.conflicts[0]);

  printSection("Conflict Round Applied");
  console.log(scenario.conflicts[0].prompt);
  for (const update of session.proposed_updates) {
    console.log(`- ${update.id} | ${update.action} | ${update.reason}`);
  }

  for (const update of [...session.proposed_updates]) {
    acceptUpdate(session, update.id);
  }

  printSection("Active Memory After Accepting Updates");
  printMemory(session.active_memory);

  for (const task of scenario.tasks) {
    const response = await generateTaskResponse(task, session, { language: "en" });
    recordTaskResponse(session, response);

    printSection(`Task Response: ${task.title}`);
    printResponse(response);
  }

  const scoring = scoreSession(session, scenario.scoring_rubric);

  printSection("Scoring Summary");
  console.log(`passed ${scoring.passed_rules}/${scoring.total_rules} rules`);
  for (const result of scoring.results) {
    console.log(`- ${result.criterion_id}: ${result.passed ? "PASS" : "FAIL"}`);
  }

  printSection("Event Log");
  for (const event of session.event_log) {
    console.log(`- ${event.id} | ${event.event_type}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
