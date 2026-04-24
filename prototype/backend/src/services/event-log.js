let eventCounter = 0;

function nextEventId() {
  eventCounter += 1;
  return `evt_${String(eventCounter).padStart(4, "0")}`;
}

export function appendEvent(session, eventType, payload) {
  const event = {
    id: nextEventId(),
    session_id: session.session_id,
    timestamp: new Date().toISOString(),
    event_type: eventType,
    payload
  };

  session.event_log.push(event);
  return event;
}
