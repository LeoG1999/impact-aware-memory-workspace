import OpenAI from "openai";

import { TASK_KINDS } from "../domain/constants.js";
import { getResponderConfig } from "./responder-config.js";

let cachedClient = null;
let cachedClientKey = "";

function getClient(config) {
  const cacheKey = `${config.baseURL || ""}::${config.model}::${config.timeoutMs}`;
  if (!cachedClient || cachedClientKey !== cacheKey) {
    cachedClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: config.baseURL,
      timeout: config.timeoutMs
    });
    cachedClientKey = cacheKey;
  }

  return cachedClient;
}

function summarizeMemory(memory) {
  return memory
    .filter((item) => item.status !== "removed")
    .map((item) => ({
      id: item.id,
      type: item.type,
      status: item.status,
      entity_ref: item.entity_ref || "",
      value: item.value ?? "",
      depends_on: item.depends_on || "",
      content: item.content,
      source_ref: item.source_ref || []
    }));
}

function getLanguageLabel(language) {
  return language === "zh" ? "Simplified Chinese" : "English";
}

function getFindingTags(scenarioId) {
  if (scenarioId === "research") {
    return ["ethics_dependency", "budget_issue", "channel_issue", "pilot_delay", "materials_owner_known"];
  }

  if (scenarioId === "outage") {
    return ["qa_blocker", "announcement_constraint", "compensation_uncertainty", "restore_hold", "hotfix_owner_known"];
  }

  return ["legal_dependency", "legal_timing_risk", "critical_bug_blocker", "launch_delay", "announcement_owner_known"];
}

function getDecisionSchema(task, scenarioId) {
  if (task.kind === TASK_KINDS.REPLAN) {
    if (scenarioId === "research") {
      return {
        type: "object",
        additionalProperties: false,
        required: ["pilot_should_start_next_week", "delay_required", "materials_owner"],
        properties: {
          pilot_should_start_next_week: { type: "boolean" },
          delay_required: { type: "boolean" },
          materials_owner: { type: "string" }
        }
      };
    }

    if (scenarioId === "outage") {
      return {
        type: "object",
        additionalProperties: false,
        required: ["full_restore_now", "hold_restore", "hotfix_owner"],
        properties: {
          full_restore_now: { type: "boolean" },
          hold_restore: { type: "boolean" },
          hotfix_owner: { type: "string" }
        }
      };
    }

    return {
      type: "object",
      additionalProperties: false,
      required: ["launch_should_proceed", "delay_required", "announcement_owner"],
      properties: {
        launch_should_proceed: { type: "boolean" },
        delay_required: { type: "boolean" },
        announcement_owner: { type: "string" }
      }
    };
  }

  if (task.kind === TASK_KINDS.RISK_ANALYSIS) {
    return {
      type: "object",
      additionalProperties: false,
      required: ["blocker_count", "unresolved_issue_count"],
      properties: {
        blocker_count: { type: "integer" },
        unresolved_issue_count: { type: "integer" }
      }
    };
  }

  if (scenarioId === "research") {
    return {
      type: "object",
      additionalProperties: false,
      required: ["recruit_now", "pilot_next_week"],
      properties: {
        recruit_now: { type: "boolean" },
        pilot_next_week: { type: "boolean" }
      }
    };
  }

  if (scenarioId === "outage") {
    return {
      type: "object",
      additionalProperties: false,
      required: ["restore_full_traffic_now", "announce_compensation_now"],
      properties: {
        restore_full_traffic_now: { type: "boolean" },
        announce_compensation_now: { type: "boolean" }
      }
    };
  }

  return {
    type: "object",
    additionalProperties: false,
    required: ["publish_this_week", "launch_on_original_date"],
    properties: {
      publish_this_week: { type: "boolean" },
      launch_on_original_date: { type: "boolean" }
    }
  };
}

function buildResponseSchema(task, scenarioId) {
  const findingTags = getFindingTags(scenarioId);
  return {
    type: "object",
    additionalProperties: false,
    required: ["task_id", "task_kind", "summary", "bullets", "finding_tags", "decisions", "usage_trace"],
    properties: {
      task_id: { type: "string", enum: [task.id] },
      task_kind: { type: "string", enum: [task.kind] },
      summary: { type: "string" },
      bullets: {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        maxItems: 5
      },
      finding_tags: {
        type: "array",
        items: { type: "string", enum: findingTags },
        uniqueItems: true
      },
      decisions: getDecisionSchema(task, scenarioId),
      usage_trace: {
        type: "array",
        items: { type: "string" },
        uniqueItems: true
      }
    }
  };
}

function buildInstructions(language, scenarioId, task) {
  return [
    "You are helping a CSCW research prototype evaluate downstream coordination tasks.",
    "Use only the provided active memory items. Do not rely on transcript details or outside knowledge.",
    "If the memory does not support a claim, state that it is untracked or uncertain rather than inventing facts.",
    `Write summary and bullets in ${getLanguageLabel(language)}.`,
    "Keep the response concise and decision-oriented.",
    "Only include memory ids in usage_trace when they materially support the answer.",
    `Return finding_tags only from the allowed list for scenario ${scenarioId} and task kind ${task.kind}.`
  ].join(" ");
}

function extractOutputText(response) {
  if (response.output_text) {
    return response.output_text;
  }

  for (const item of response.output || []) {
    if (item.type !== "message") {
      continue;
    }

    for (const content of item.content || []) {
      if (content.type === "output_text") {
        return content.text;
      }
    }
  }

  return "";
}

export async function generateOpenAiTaskResponse(task, session, options = {}) {
  const language = options.language === "zh" ? "zh" : "en";
  const config = getResponderConfig();
  const client = getClient(config);
  const payload = {
    scenario_id: session.scenario_id,
    session_id: session.session_id,
    condition: session.condition,
    task: {
      id: task.id,
      kind: task.kind,
      title: language === "zh" ? task.title_zh || task.title : task.title,
      prompt: language === "zh" ? task.prompt_zh || task.prompt : task.prompt
    },
    allowed_finding_tags: getFindingTags(session.scenario_id),
    active_memory: summarizeMemory(session.active_memory)
  };

  const response = await client.responses.create({
    model: config.model,
    temperature: config.temperature,
    max_output_tokens: config.maxOutputTokens,
    metadata: {
      app: "meeting-memory-governance",
      session_id: session.session_id,
      scenario_id: session.scenario_id,
      task_id: task.id
    },
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: buildInstructions(language, session.scenario_id, task) }]
      },
      {
        role: "user",
        content: [{ type: "input_text", text: JSON.stringify(payload, null, 2) }]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "meeting_memory_task_response",
        strict: true,
        schema: buildResponseSchema(task, session.scenario_id)
      }
    }
  });

  const rawText = extractOutputText(response);
  if (!rawText) {
    throw new Error("OpenAI response did not contain structured output text.");
  }

  const parsed = JSON.parse(rawText);

  return {
    ...parsed,
    response_source: "openai",
    provider: "openai",
    model: response.model || config.model,
    llm_response_id: response.id,
    fallback_used: false,
    raw_usage: response.usage || null
  };
}
