const RESPONDER_MODES = new Set(["auto", "deterministic", "openai"]);

function normalizeMode(value) {
  const mode = String(value || "auto").trim().toLowerCase();
  return RESPONDER_MODES.has(mode) ? mode : "auto";
}

function safeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getResponderConfig() {
  const requestedMode = normalizeMode(process.env.MMG_RESPONDER_MODE || "auto");
  const openaiReady = Boolean(process.env.OPENAI_API_KEY);
  const model = process.env.OPENAI_MODEL || "gpt-4.1-2025-04-14";
  const timeoutMs = safeNumber(process.env.OPENAI_TIMEOUT_MS, 30000);
  const maxOutputTokens = safeNumber(process.env.OPENAI_MAX_OUTPUT_TOKENS, 700);
  const temperature = Number.isFinite(Number(process.env.OPENAI_TEMPERATURE))
    ? Number(process.env.OPENAI_TEMPERATURE)
    : 0.2;

  let effectiveMode = "deterministic";
  let status = "fallback";

  if (requestedMode === "deterministic") {
    effectiveMode = "deterministic";
    status = "ready";
  } else if (openaiReady) {
    effectiveMode = "openai";
    status = "ready";
  } else if (requestedMode === "openai") {
    effectiveMode = "openai_unavailable";
    status = "misconfigured";
  }

  return {
    requestedMode,
    effectiveMode,
    status,
    openaiReady,
    provider: effectiveMode === "openai" ? "openai" : "local",
    model,
    timeoutMs,
    maxOutputTokens,
    temperature,
    baseURL: process.env.OPENAI_BASE_URL || undefined
  };
}

export function getPublicResponderConfig() {
  const config = getResponderConfig();
  return {
    requested_mode: config.requestedMode,
    effective_mode: config.effectiveMode,
    status: config.status,
    provider: config.provider,
    model: config.model,
    openai_ready: config.openaiReady
  };
}
