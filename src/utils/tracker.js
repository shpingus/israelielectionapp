// Anonymous user behavior tracking utility

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Persistent across browser restarts (identifies repeat users)
export function getOrCreateClientId() {
  let clientId = localStorage.getItem('israeli_elections_client_id');
  if (!clientId) {
    clientId = generateUUID();
    localStorage.setItem('israeli_elections_client_id', clientId);
  }
  return clientId;
}

// Temporary for this tab session (identifies single quiz attempts)
export function startNewSession() {
  const sessionId = generateUUID();
  sessionStorage.setItem('israeli_elections_session_id', sessionId);
  return sessionId;
}

export function getActiveSessionId() {
  let sessionId = sessionStorage.getItem('israeli_elections_session_id');
  if (!sessionId) {
    sessionId = startNewSession();
  }
  return sessionId;
}

// Track modular action clicks, changes, navigation
export function trackAction(actionType, targetId = null, value = null, language = 'he') {
  const sessionId = getActiveSessionId();
  const clientId = getOrCreateClientId();

  fetch('/api/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      clientId,
      actionType,
      targetId,
      value: value !== null ? String(value) : null,
      language
    }),
  }).catch(err => {
    console.error('Failed to log tracking action:', err);
  });
}

// Finalize session results
export function submitSessionResults(topParty, topScore, language) {
  const sessionId = getActiveSessionId();
  const clientId = getOrCreateClientId();

  return fetch('/api/submit-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      clientId,
      topParty,
      topScore,
      language
    }),
  }).catch(err => {
    console.error('Failed to submit session results:', err);
  });
}

// Submit voting consideration survey feedback
export function submitConsiderationFeedback(choice) {
  const sessionId = getActiveSessionId();
  const clientId = getOrCreateClientId();
  const lang = localStorage.getItem('israeli_elections_lang') || 'he';

  // Log as a tracking action event
  trackAction('submit_feedback', 'considered_voting', choice, lang);

  // Update session row with considered_voting feedback
  return fetch('/api/submit-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      clientId,
      consideredVoting: choice,
      language: lang
    }),
  }).catch(err => {
    console.error('Failed to submit feedback:', err);
  });
}
