import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

import { CONDITIONS } from "./domain/constants.js";
import { loadScenarioBundle } from "./services/scenario-loader.js";
import {
  acceptUpdate,
  addMemoryItem,
  applyConflictRound,
  createSession,
  editMemoryItem,
  markMemoryUncertain,
  recordTaskResponse,
  rejectUpdate,
  removeMemoryItem
} from "./services/session-service.js";
import { generateTaskResponse } from "./services/responder.js";
import { getPublicResponderConfig } from "./services/responder-config.js";
import { scoreSession } from "./services/scoring.js";
import { buildEventLogCsv, buildSessionExport, writeSessionExportFiles } from "./services/export-service.js";
import { getSession, saveSession } from "./services/session-store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "../../frontend");
const EXPORT_ROOT = path.resolve(__dirname, "../../../analysis/exports");
const PORT = Number(process.env.PORT || 3087);
const HOST = process.env.HOST || "127.0.0.1";
const BASE_PATH = normalizeBasePath(process.env.BASE_PATH || "/");
const ACCESS_CODE = process.env.ACCESS_CODE || "MMG-842731";
const ACCESS_COOKIE = "mmg_access";

const SCENARIO_META = Object.freeze([
  { id: "launch", title: "Product Launch Coordination", domain: "launch" },
  { id: "research", title: "Research Pilot Coordination", domain: "research" },
  { id: "outage", title: "Incident Response Coordination", domain: "outage" }
]);

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function sendText(res, statusCode, data, contentType = "text/plain; charset=utf-8", extraHeaders = {}) {
  res.writeHead(statusCode, { "Content-Type": contentType, ...extraHeaders });
  res.end(data);
}

function normalizeBasePath(input) {
  if (!input || input === "/") {
    return "/";
  }

  const trimmed = input.startsWith("/") ? input : `/${input}`;
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function stripBasePath(pathname) {
  if (BASE_PATH === "/") {
    return pathname;
  }

  if (pathname === BASE_PATH) {
    return "/";
  }

  if (pathname.startsWith(`${BASE_PATH}/`)) {
    return pathname.slice(BASE_PATH.length);
  }

  return null;
}

function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  return Object.fromEntries(
    raw
      .split(";")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((entry) => {
        const pivot = entry.indexOf("=");
        if (pivot === -1) {
          return [entry, ""];
        }
        return [entry.slice(0, pivot), decodeURIComponent(entry.slice(pivot + 1))];
      })
  );
}

function isAuthorized(req) {
  const cookies = parseCookies(req);
  return cookies[ACCESS_COOKIE] === "ok";
}

function unauthorizedApi(res) {
  sendJson(res, 401, { error: "Access code required" });
}

function renderGatePage(message = "") {
  const escapedMessage = message
    ? `<p class="message">${message}</p>`
    : `<p class="hint">Enter the access code to open the research prototype.</p>`;
  const verifyEndpoint = `${BASE_PATH === "/" ? "" : BASE_PATH}/api/auth/verify`;
  const redirectPath = `${BASE_PATH === "/" ? "/" : `${BASE_PATH}/`}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Access Required</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f3eee5;
        --panel: rgba(255,255,255,0.88);
        --ink: #1f2937;
        --muted: #6b7280;
        --accent: #0d6e6e;
        --line: rgba(31,41,55,0.15);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at top left, rgba(13,110,110,0.14), transparent 28%),
          radial-gradient(circle at bottom right, rgba(143,63,47,0.12), transparent 24%),
          linear-gradient(180deg, #f8f4ec 0%, var(--bg) 100%);
        font-family: Georgia, "Times New Roman", serif;
        color: var(--ink);
      }
      .panel {
        width: min(92vw, 460px);
        padding: 28px;
        border-radius: 24px;
        background: var(--panel);
        border: 1px solid var(--line);
        box-shadow: 0 18px 40px rgba(54,59,76,0.12);
      }
      .eyebrow {
        margin: 0 0 10px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 12px;
        color: var(--accent);
      }
      h1 { margin: 0 0 12px; font-size: 34px; line-height: 1.08; }
      p { margin: 0 0 16px; color: var(--muted); line-height: 1.5; }
      .message { color: #8f3f2f; }
      form { display: grid; gap: 12px; }
      input {
        width: 100%;
        padding: 12px 14px;
        font: inherit;
        border-radius: 12px;
        border: 1px solid var(--line);
      }
      button {
        padding: 12px 14px;
        border: 0;
        border-radius: 12px;
        font: inherit;
        background: var(--accent);
        color: white;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <main class="panel">
      <p class="eyebrow">Protected Research App</p>
      <h1>Access Code Required</h1>
      ${escapedMessage}
      <form id="gate-form">
        <input id="access-code" name="code" placeholder="Enter access code" autocomplete="off" />
        <button type="submit">Enter</button>
      </form>
    </main>
    <script>
      const form = document.getElementById("gate-form");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const code = document.getElementById("access-code").value;
        const response = await fetch(${JSON.stringify(verifyEndpoint)}, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code })
        });

        if (response.ok) {
          window.location.href = ${JSON.stringify(redirectPath)};
          return;
        }

        window.location.href = ${JSON.stringify(redirectPath)} + "?error=1";
      });
    </script>
  </body>
</html>`;
}

function getStaticContentType(filePath) {
  if (filePath.endsWith(".html")) {
    return "text/html; charset=utf-8";
  }
  if (filePath.endsWith(".css")) {
    return "text/css; charset=utf-8";
  }
  if (filePath.endsWith(".js")) {
    return "application/javascript; charset=utf-8";
  }
  return "text/plain; charset=utf-8";
}

function serveStatic(req, res, pathname) {
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const fullPath = path.join(FRONTEND_ROOT, relativePath);

  if (!fullPath.startsWith(FRONTEND_ROOT) || !fs.existsSync(fullPath)) {
    notFound(res);
    return;
  }

  const content = fs.readFileSync(fullPath);
  sendText(res, 200, content, getStaticContentType(fullPath), {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0"
  });
}

function sanitizeSession(session, fullScenario = null) {
  return {
    session_id: session.session_id,
    participant_id: session.participant_id,
    condition: session.condition,
    permissions: session.permissions,
    scenario_id: session.scenario_id,
    step: session.step,
    transcript: fullScenario?.transcript || session.transcript,
    active_memory: session.permissions.canViewMemory ? session.active_memory : [],
    proposed_updates: session.permissions.canViewProposedUpdates ? session.proposed_updates : [],
    conflict_queue: session.permissions.canViewConflictQueue ? session.conflict_queue : [],
    current_conflict_round: session.permissions.canViewConflictQueue ? session.current_conflict_round : null,
    tasks: fullScenario?.tasks || [],
    task_responses: session.task_responses,
    event_log_count: session.event_log.length
  };
}

async function runTask(session, scenario, taskId, options = {}) {
  const task = scenario.tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new Error(`Unknown task: ${taskId}`);
  }

  const response = await generateTaskResponse(task, session, options);
  recordTaskResponse(session, response);
  return response;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = stripBasePath(url.pathname);

  if (pathname === null) {
    notFound(res);
    return;
  }

  try {
    if (pathname === "/api/auth/verify" && req.method === "POST") {
      const body = await parseBody(req);
      if ((body.code || "").trim() !== ACCESS_CODE) {
        unauthorizedApi(res);
        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": `${ACCESS_COOKIE}=ok; Path=${BASE_PATH === "/" ? "/" : `${BASE_PATH}/`}; HttpOnly; SameSite=Lax`
      });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    const authorized = isAuthorized(req);

    if (!authorized) {
      if (pathname.startsWith("/api/")) {
        unauthorizedApi(res);
        return;
      }

      if (req.method === "GET") {
        const message = url.searchParams.get("error") ? "Incorrect code. Try again." : "";
        sendText(res, 200, renderGatePage(message), "text/html; charset=utf-8");
        return;
      }

      unauthorizedApi(res);
      return;
    }

    if (pathname === "/api/scenarios" && req.method === "GET") {
      sendJson(res, 200, {
        scenarios: SCENARIO_META,
        conditions: Object.values(CONDITIONS),
        app_config: {
          responder: getPublicResponderConfig()
        }
      });
      return;
    }

    if (pathname === "/api/sessions" && req.method === "POST") {
      const body = await parseBody(req);
      const condition = body.condition || CONDITIONS.VISIBLE_EDITABLE;
      const scenarioId = body.scenarioId || "launch";
      const participantId = body.participantId || "demo_participant";
      const scenario = loadScenarioBundle(scenarioId);

      scenario.title = SCENARIO_META.find((item) => item.id === scenarioId)?.title || scenarioId;
      const session = saveSession(createSession({ participantId, condition, scenario }));
      sendJson(res, 201, { session: sanitizeSession(session, scenario) });
      return;
    }

    if (pathname.startsWith("/api/sessions/")) {
      const parts = pathname.split("/").filter(Boolean);
      const sessionId = parts[2];
      const session = getSession(sessionId);

      if (!session) {
        notFound(res);
        return;
      }

      const scenario = loadScenarioBundle(session.scenario_id);

      if (parts.length === 3 && req.method === "GET") {
        sendJson(res, 200, { session: sanitizeSession(session, scenario) });
        return;
      }

      if (parts.length === 5 && parts[3] === "conflicts" && req.method === "POST") {
        const roundId = parts[4];
        const round = scenario.conflicts.find((item) => item.id === roundId);
        if (!round) {
          notFound(res);
          return;
        }
        applyConflictRound(session, round);
        sendJson(res, 200, { session: sanitizeSession(session, scenario) });
        return;
      }

      if (parts.length === 6 && parts[3] === "updates" && parts[5] === "accept" && req.method === "POST") {
        acceptUpdate(session, parts[4], "participant");
        sendJson(res, 200, { session: sanitizeSession(session, scenario) });
        return;
      }

      if (parts.length === 6 && parts[3] === "updates" && parts[5] === "reject" && req.method === "POST") {
        rejectUpdate(session, parts[4], "participant");
        sendJson(res, 200, { session: sanitizeSession(session, scenario) });
        return;
      }

      if (parts.length === 6 && parts[3] === "tasks" && parts[5] === "run" && req.method === "POST") {
        const body = await parseBody(req);
        const response = await runTask(session, scenario, parts[4], {
          language: body.language || "en"
        });
        sendJson(res, 200, {
          response,
          session: sanitizeSession(session, scenario),
          scoring: scoreSession(session, scenario.scoring_rubric)
        });
        return;
      }

      if (parts.length === 4 && parts[3] === "memory" && req.method === "POST") {
        const body = await parseBody(req);
        addMemoryItem(
          session,
          {
            type: body.type,
            content: body.content,
            entity_ref: body.entity_ref || "",
            value: body.value ?? null,
            depends_on: body.depends_on || "",
            status: body.status || "active",
            source_ref: body.source_ref || ["user_added"],
            confidence: Number(body.confidence || 1)
          },
          "participant"
        );
        sendJson(res, 201, { session: sanitizeSession(session, scenario) });
        return;
      }

      if (parts.length === 5 && parts[3] === "memory" && req.method === "PATCH") {
        const body = await parseBody(req);
        editMemoryItem(
          session,
          parts[4],
          {
            content: body.content,
            value: body.value,
            status: body.status,
            entity_ref: body.entity_ref,
            depends_on: body.depends_on
          },
          "participant"
        );
        sendJson(res, 200, { session: sanitizeSession(session, scenario) });
        return;
      }

      if (parts.length === 6 && parts[3] === "memory" && parts[5] === "uncertain" && req.method === "POST") {
        markMemoryUncertain(session, parts[4], "participant");
        sendJson(res, 200, { session: sanitizeSession(session, scenario) });
        return;
      }

      if (parts.length === 6 && parts[3] === "memory" && parts[5] === "delete" && req.method === "POST") {
        removeMemoryItem(session, parts[4], "participant");
        sendJson(res, 200, { session: sanitizeSession(session, scenario) });
        return;
      }

      if (parts.length === 5 && parts[3] === "export" && parts[4] === "json" && req.method === "GET") {
        sendJson(res, 200, buildSessionExport(session));
        return;
      }

      if (parts.length === 5 && parts[3] === "export" && parts[4] === "csv" && req.method === "GET") {
        sendText(res, 200, buildEventLogCsv(session), "text/csv; charset=utf-8");
        return;
      }

      if (parts.length === 5 && parts[3] === "export" && parts[4] === "save" && req.method === "POST") {
        const saved = writeSessionExportFiles(session, EXPORT_ROOT);
        sendJson(res, 200, { saved });
        return;
      }
    }

    if (req.method === "GET") {
      serveStatic(req, res, pathname);
      return;
    }

    notFound(res);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Research prototype listening on http://${HOST}:${PORT}${BASE_PATH === "/" ? "/" : BASE_PATH + "/"}`);
});
