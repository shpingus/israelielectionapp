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

    const { sessionId, clientId, topParty, topScore, language, consideredVoting } = body;

    // Validate minimum required identifiers
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

    // IP and UserAgent privacy-centric hashing for inserts
    const ip = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
    const userAgent = request.headers.get("User-Agent") || "";
    const ipHash = await sha256(ip + "|" + userAgent);

    // UPSERT pattern: insert a new session, or update the existing session's values
    const query = `
      INSERT INTO sessions (session_id, client_id, ip_hash, user_agent, language, top_party, top_score, considered_voting)
      VALUES (?1, ?2, ?3, ?4, COALESCE(?5, 'he'), ?6, ?7, ?8)
      ON CONFLICT(session_id) DO UPDATE SET
        language = CASE WHEN ?5 IS NOT NULL THEN ?5 ELSE language END,
        top_party = CASE WHEN ?6 IS NOT NULL THEN ?6 ELSE top_party END,
        top_score = CASE WHEN ?7 IS NOT NULL THEN ?7 ELSE top_score END,
        considered_voting = CASE WHEN ?8 IS NOT NULL THEN ?8 ELSE considered_voting END
    `;

    const result = await env.DB.prepare(query)
      .bind(
        sessionId,
        clientId,
        ipHash,
        userAgent,
        language || null,
        topParty || null,
        topScore !== undefined ? topScore : null,
        consideredVoting || null
      )
      .run();

    if (!result.success) {
      throw new Error("D1 query returned unsuccessful execution state");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
