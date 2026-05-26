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
export function startNewSession(displayName = null) {
  const sessionId = generateUUID();
  sessionStorage.setItem('israeli_elections_session_id', sessionId);
  if (displayName) {
    sessionStorage.setItem('israeli_elections_display_name', displayName);
  } else {
    sessionStorage.removeItem('israeli_elections_display_name');
  }
  return sessionId;
}

export function getActiveSessionId() {
  let sessionId = sessionStorage.getItem('israeli_elections_session_id');
  if (!sessionId) {
    sessionId = startNewSession();
  }
  return sessionId;
}

// DEBUG flag to prevent sending actions to the main DB during testing
const DEBUG_MODE = true;

// Track modular action clicks, changes, navigation
export function trackAction(actionType, targetId = null, value = null, language = 'he') {
  const isLoggingDisabled = localStorage.getItem('disable_session_logging') === 'true';
  if (DEBUG_MODE || isLoggingDisabled) {
    console.log(`[DEBUG] trackAction prevented DB write (isLoggingDisabled: ${isLoggingDisabled}):`, { actionType, targetId, value, language });
    return;
  }

  const sessionId = getActiveSessionId();
  const clientId = getOrCreateClientId();
  const displayName = sessionStorage.getItem('israeli_elections_display_name') || null;

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
      language,
      displayName
    }),
  }).catch(err => {
    console.error('Failed to log tracking action:', err);
  });
}

// Finalize session results
export function submitSessionResults(topParty, topScore, language) {
  const isLoggingDisabled = localStorage.getItem('disable_session_logging') === 'true';
  if (DEBUG_MODE || isLoggingDisabled) {
    console.log(`[DEBUG] submitSessionResults prevented DB write (isLoggingDisabled: ${isLoggingDisabled}):`, { topParty, topScore, language });
    return Promise.resolve();
  }

  const sessionId = getActiveSessionId();
  const clientId = getOrCreateClientId();
  const displayName = sessionStorage.getItem('israeli_elections_display_name') || null;

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
      language,
      displayName
    }),
  }).catch(err => {
    console.error('Failed to submit session results:', err);
  });
}

// Submit voting consideration survey feedback
export function submitConsiderationFeedback(choice) {
  const sessionId = getActiveSessionId();
  const clientId = getOrCreateClientId();
  const displayName = sessionStorage.getItem('israeli_elections_display_name') || null;
  const lang = localStorage.getItem('israeli_elections_lang') || 'he';

  // Log as a tracking action event
  trackAction('submit_feedback', 'considered_voting', choice, lang);

  const isLoggingDisabled = localStorage.getItem('disable_session_logging') === 'true';
  if (DEBUG_MODE || isLoggingDisabled) {
    console.log(`[DEBUG] submitConsiderationFeedback prevented DB write (isLoggingDisabled: ${isLoggingDisabled}):`, { choice, lang });
    return Promise.resolve();
  }

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
      language: lang,
      displayName
    }),
  }).catch(err => {
    console.error('Failed to submit feedback:', err);
  });
}
