async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    if (!env.DB) {
      return new Response(
        JSON.stringify({ error: "Database binding 'DB' is not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const adminToken = env.ADMIN_TOKEN;
    if (!adminToken) {
      return new Response(
        JSON.stringify({ error: "Administration is not configured. Server environment missing ADMIN_TOKEN." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const expectedCookieValue = await sha256(adminToken);

    const authHeader = request.headers.get("Authorization");
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, ...valueParts] = cookie.trim().split("=");
      if (key) {
        acc[key] = valueParts.join("=");
      }
      return acc;
    }, {});
    const tokenFromCookie = cookies["elections_admin_token"];

    const isAuthHeaderValid = authHeader && authHeader === `Bearer ${adminToken}`;
    const isCookieValid = tokenFromCookie && tokenFromCookie === expectedCookieValue;

    if (!isAuthHeaderValid && !isCookieValid) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build batch statements for advanced tracking metrics
    const stmtSessions = env.DB.prepare(`
      SELECT 
        COUNT(*) as total, 
        SUM(CASE WHEN top_party IS NOT NULL THEN 1 ELSE 0 END) as completed,
        AVG(top_score) as avgScore 
      FROM sessions
    `);

    const stmtParties = env.DB.prepare(`
      SELECT top_party as partyId, COUNT(*) as count, AVG(top_score) as avgScore 
      FROM sessions 
      WHERE top_party IS NOT NULL 
      GROUP BY top_party 
      ORDER BY count DESC
    `);

    const stmtFeedback = env.DB.prepare(`
      SELECT considered_voting as choice, COUNT(*) as count 
      FROM sessions 
      WHERE considered_voting IS NOT NULL 
      GROUP BY considered_voting
    `);

    const stmtActionTypes = env.DB.prepare(`
      SELECT action_type as actionType, COUNT(*) as count 
      FROM actions 
      GROUP BY action_type 
      ORDER BY count DESC
    `);

    const stmtAvgActions = env.DB.prepare(`
      SELECT AVG(action_count) as avgActions 
      FROM (SELECT COUNT(*) as action_count FROM actions GROUP BY session_id)
    `);

    const stmtLanguages = env.DB.prepare(`
      SELECT language, COUNT(*) as count 
      FROM sessions 
      GROUP BY language 
      ORDER BY count DESC
    `);

    const stmtRecent = env.DB.prepare(`
      SELECT session_id as sessionId, created_at as createdAt, top_party as topParty, top_score as topScore, considered_voting as consideredVoting, language 
      FROM sessions 
      WHERE top_party IS NOT NULL 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    // Execute in batch for high performance
    const results = await env.DB.batch([
      stmtSessions,
      stmtParties,
      stmtFeedback,
      stmtActionTypes,
      stmtAvgActions,
      stmtLanguages,
      stmtRecent
    ]);

    const sessionSummary = results[0].results[0] || { total: 0, completed: 0, avgScore: 0 };
    const partyStats = results[1].results || [];
    const feedbackStats = results[2].results || [];
    const actionStats = results[3].results || [];
    const avgActionsStats = results[4].results[0] || { avgActions: 0 };
    const languageStats = results[5].results || [];
    const recentSessions = results[6].results || [];

    // Map feedback stats to a cleaner object
    const feedbackSummary = { yes: 0, no: 0, maybe: 0 };
    feedbackStats.forEach(row => {
      if (row.choice === 'yes') feedbackSummary.yes = row.count;
      if (row.choice === 'no') feedbackSummary.no = row.count;
      if (row.choice === 'maybe') feedbackSummary.maybe = row.count;
    });

    const stats = {
      summary: {
        totalSessionsStarted: sessionSummary.total || 0,
        totalSessionsCompleted: sessionSummary.completed || 0,
        completionRate: sessionSummary.total ? Math.round((sessionSummary.completed / sessionSummary.total) * 100) : 0,
        averageMatchScore: sessionSummary.avgScore ? Math.round(sessionSummary.avgScore) : 0,
        averageActionsPerSession: avgActionsStats.avgActions ? Math.round(avgActionsStats.avgActions * 10) / 10 : 0
      },
      partyAlignmentDistribution: partyStats,
      consideredVotingFeedback: feedbackSummary,
      actionDistribution: actionStats,
      languageDistribution: languageStats,
      recentCompletions: recentSessions
    };

    const responseHeaders = {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=5"
    };

    if (isAuthHeaderValid) {
      responseHeaders["Set-Cookie"] = `elections_admin_token=${expectedCookieValue}; Path=/; Max-Age=7776000; Secure; HttpOnly; SameSite=Strict`;
    }

    return new Response(
      JSON.stringify(stats),
      {
        status: 200,
        headers: responseHeaders
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
