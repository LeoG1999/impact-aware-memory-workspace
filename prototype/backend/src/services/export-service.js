import fs from "node:fs";
import path from "node:path";

function toCsvValue(value) {
  const raw = typeof value === "string" ? value : JSON.stringify(value);
  const escaped = String(raw).replaceAll("\"", "\"\"");
  return `"${escaped}"`;
}

export function buildSessionExport(session) {
  return {
    session: {
      session_id: session.session_id,
      participant_id: session.participant_id,
      condition: session.condition,
      scenario_id: session.scenario_id,
      step: session.step
    },
    active_memory: session.active_memory,
    proposed_updates: session.proposed_updates,
    conflict_queue: session.conflict_queue,
    current_conflict_round: session.current_conflict_round,
    task_responses: session.task_responses,
    event_log: session.event_log
  };
}

export function buildEventLogCsv(session) {
  const rows = [
    ["id", "session_id", "timestamp", "event_type", "payload"]
  ];

  for (const event of session.event_log) {
    rows.push([
      event.id,
      event.session_id,
      event.timestamp,
      event.event_type,
      JSON.stringify(event.payload)
    ]);
  }

  return rows.map((row) => row.map(toCsvValue).join(",")).join("\n");
}

export function writeSessionExportFiles(session, outputRoot) {
  const sessionDir = path.join(outputRoot, session.session_id);
  fs.mkdirSync(sessionDir, { recursive: true });

  const jsonPath = path.join(sessionDir, "session.json");
  const csvPath = path.join(sessionDir, "event_log.csv");

  fs.writeFileSync(jsonPath, JSON.stringify(buildSessionExport(session), null, 2));
  fs.writeFileSync(csvPath, buildEventLogCsv(session));

  return {
    directory: sessionDir,
    files: {
      json: jsonPath,
      csv: csvPath
    }
  };
}
