import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { CONDITIONS } from "../domain/constants.js";
import { loadScenarioBundle } from "../services/scenario-loader.js";
import {
  addMemoryItem,
  createSession,
  editMemoryItem,
  markMemoryUncertain,
  removeMemoryItem
} from "../services/session-service.js";
import { writeSessionExportFiles } from "../services/export-service.js";

test("editable session supports add, edit, uncertain, remove, and export", () => {
  const scenario = loadScenarioBundle("launch");
  const session = createSession({
    participantId: "editor_test",
    condition: CONDITIONS.VISIBLE_EDITABLE,
    scenario
  });

  editMemoryItem(session, "mem_owner_announce", { value: "marketing_lead", content: "Marketing lead owns the announcement draft." });
  markMemoryUncertain(session, "mem_deadline_launch");
  addMemoryItem(session, {
    type: "constraint",
    content: "Legal review must happen before publication.",
    entity_ref: "announcement",
    value: "legal_review_before_publish",
    depends_on: "",
    status: "active",
    source_ref: ["user_added"],
    confidence: 1
  });
  removeMemoryItem(session, "mem_task_bugfix");

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mmg-export-"));
  const saved = writeSessionExportFiles(session, tmpDir);

  assert.equal(session.active_memory.find((item) => item.id === "mem_owner_announce")?.value, "marketing_lead");
  assert.equal(session.active_memory.find((item) => item.id === "mem_deadline_launch")?.status, "uncertain");
  assert.equal(session.active_memory.find((item) => item.id === "mem_task_bugfix")?.status, "removed");
  assert.ok(session.active_memory.some((item) => item.value === "legal_review_before_publish"));
  assert.ok(fs.existsSync(saved.files.json));
  assert.ok(fs.existsSync(saved.files.csv));
});
