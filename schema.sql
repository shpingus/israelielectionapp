-- D1 SQLite database schema for Israeli Elections survey tracking

-- Drop legacy table if it exists
DROP TABLE IF EXISTS responses;

-- Session completions table
CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,       -- UUID generated per quiz attempt
  client_id TEXT NOT NULL,           -- Persistent UUID stored in localStorage
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_hash TEXT NOT NULL,             -- Anonymized SHA-256 hash of IP + UserAgent
  user_agent TEXT,                   -- User browser details
  language TEXT NOT NULL,            -- Active language ('he', 'en', 'ar')
  top_party TEXT,                    -- Matched party (null if they drop before finishing)
  top_score INTEGER,                 -- Match percentage score (null if drop)
  considered_voting TEXT,            -- Post-quiz survey feedback ('yes', 'no', 'maybe', null)
  display_name TEXT                  -- Optional custom or random user display name
);

-- Granular user actions (clicks, changes, navigations)
CREATE TABLE IF NOT EXISTS actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,          -- Links to sessions.session_id
  client_id TEXT NOT NULL,           -- Links to sessions.client_id
  action_type TEXT NOT NULL,         -- 'start_quiz', 'answer_question', 'change_answer', 'navigate_back', 'view_results', 'toggle_accessibility', 'submit_feedback'
  target_id TEXT,                    -- Contextual ID (e.g. question ID, party ID, accessibility setting key)
  value TEXT,                        -- Associated value (e.g. stance value, selected choice, 'true'/'false')
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance analysis
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_top_party ON sessions(top_party);

CREATE INDEX IF NOT EXISTS idx_actions_session_id ON actions(session_id);
CREATE INDEX IF NOT EXISTS idx_actions_action_type ON actions(action_type);
CREATE INDEX IF NOT EXISTS idx_actions_timestamp ON actions(timestamp);
