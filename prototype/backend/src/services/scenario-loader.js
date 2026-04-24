import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../../..");
const SCENARIOS_ROOT = path.join(PROJECT_ROOT, "scenarios");

const BUNDLE_FILES = Object.freeze([
  "transcript",
  "gold_memory",
  "seed_active_memory",
  "proposed_updates",
  "conflicts",
  "tasks",
  "scoring_rubric"
]);

export function loadScenarioBundle(scenarioId) {
  const scenarioDir = path.join(SCENARIOS_ROOT, scenarioId);
  const bundle = {
    scenario_id: scenarioId,
    title: scenarioId,
    domain: scenarioId
  };

  for (const name of BUNDLE_FILES) {
    const fullPath = path.join(scenarioDir, `${name}.json`);
    bundle[name] = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  }

  return bundle;
}

export function getScenariosRoot() {
  return SCENARIOS_ROOT;
}
