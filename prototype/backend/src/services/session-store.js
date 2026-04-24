const sessions = new Map();

export function saveSession(session) {
  sessions.set(session.session_id, session);
  return session;
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

export function listSessions() {
  return [...sessions.values()];
}
