# Database Schema & Migration Guidelines

This document outlines the current state of the Cloudflare D1 database (SQLite) for the Israeli Elections survey application and provides mitigation steps to prevent future out-of-sync schema issues between local development and production.

---

## 1. Current Database State

The database contains two tables: `sessions` and `actions`.

### Table: `sessions`
Stores unique sessions for each quiz attempt.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `session_id` | `TEXT` | `PRIMARY KEY` | Unique UUID generated per quiz attempt |
| `client_id` | `TEXT` | `NOT NULL` | Persistent browser UUID stored in localStorage |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Time of session initialization |
| `ip_hash` | `TEXT` | `NOT NULL` | Anonymized SHA-256 hash of IP + UserAgent |
| `user_agent` | `TEXT` | | User agent header string |
| `language` | `TEXT` | `NOT NULL` | Session language (`he`, `en`, `ar`) |
| `top_party` | `TEXT` | | The matched party ID (null if dropped out) |
| `top_score` | `INTEGER` | | Match percentage score (null if dropped out) |
| `considered_voting` | `TEXT` | | Feedback survey selection (`yes`, `no`, `maybe`, null) |
| `display_name` | `TEXT` | | Selected or generated user display name |

### Table: `actions`
Stores granular user actions during the session.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Auto-incremented unique action ID |
| `session_id` | `TEXT` | `NOT NULL` | References `sessions.session_id` |
| `client_id` | `TEXT` | `NOT NULL` | References `sessions.client_id` |
| `action_type` | `TEXT` | `NOT NULL` | Type of interaction (e.g. `start_quiz`, `answer_question`) |
| `target_id` | `TEXT` | | ID of target component (e.g. question/party ID) |
| `value` | `TEXT` | | Associated value (e.g. choice, accessibility state) |
| `timestamp` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Action timestamp |

---

## 2. Mitigation Strategy for Future Schema Updates

To prevent local and production environments from drifting (which previously caused a silent 500 error due to a missing `display_name` column in production), follow these guidelines:

### A. Incremental Migration Scripts
Instead of running absolute `schema.sql` setups, place incremental migrations in a new `/migrations` directory:
* Format: `migrations/YYYYMMDD_description.sql` (e.g. `migrations/20260523_add_display_name_to_sessions.sql`).
* This makes it clear which migrations need to be applied to production.

### B. Two-Step Deployments
Whenever you modify the database schema:
1. **Apply Locally:**
   ```bash
   npx wrangler d1 execute DB --local --file=./migrations/YYYYMMDD_description.sql
   ```
2. **Apply to Production:**
   ```bash
   npx wrangler d1 execute elections-db --remote --file=./migrations/YYYYMMDD_description.sql
   ```

### C. Graceful Fallbacks in Code
Always build APIs to handle missing columns or table mismatches gracefully and report descriptive errors rather than generic "Internal Server Error" messages. (The frontend now displays API/connection errors on the login screen).
