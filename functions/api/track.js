// SHA-256 helper for privacy-preserving client/IP tracking
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.DB) {
      return new Response(
        JSON.stringify({ error: "Database binding 'DB' is not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { sessionId, clientId, actionType, targetId, value, language, displayName } = body;

    // Validate required fields
    if (!sessionId || typeof sessionId !== 'string') {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'sessionId'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!clientId || typeof clientId !== 'string') {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'clientId'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!actionType || typeof actionType !== 'string') {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'actionType'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // IP and UserAgent privacy-centric hashing
    const ip = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
    const userAgent = request.headers.get("User-Agent") || "";
    const ipHash = await sha256(ip + "|" + userAgent);

    const activeLanguage = language || "he";

    // 1. Ensure the session exists in the sessions table (UPSERT to capture display_name)
    const initSessionQuery = `
      INSERT INTO sessions (session_id, client_id, ip_hash, user_agent, language, display_name)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6)
      ON CONFLICT(session_id) DO UPDATE SET
        display_name = CASE WHEN ?6 IS NOT NULL THEN ?6 ELSE display_name END
    `;

    // 2. Insert the tracking action
    const insertActionQuery = `
      INSERT INTO actions (session_id, client_id, action_type, target_id, value)
      VALUES (?, ?, ?, ?, ?)
    `;

    // Run queries in batch for efficiency
    const stmtSession = env.DB.prepare(initSessionQuery).bind(
      sessionId,
      clientId,
      ipHash,
      userAgent,
      activeLanguage,
      displayName || null
    );

    const stmtAction = env.DB.prepare(insertActionQuery).bind(
      sessionId,
      clientId,
      actionType,
      targetId !== undefined ? String(targetId) : null,
      value !== undefined ? String(value) : null
    );

    const results = await env.DB.batch([stmtSession, stmtAction]);

    if (!results[1].success) {
      throw new Error("Failed to insert action into actions table");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
