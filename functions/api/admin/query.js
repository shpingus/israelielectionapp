async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
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

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { query } = body;
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'query' parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cleanQuery = query.trim().toLowerCase();
    
    // Enforce read-only SELECT or WITH statement
    if (!cleanQuery.startsWith("select") && !cleanQuery.startsWith("with")) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Only SELECT or WITH queries are allowed." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for modifying keywords anywhere in the query (guarding against stacked commands)
    const destructiveKeywords = ['insert', 'update', 'delete', 'drop', 'create', 'alter', 'replace', 'truncate'];
    const hasDestructive = destructiveKeywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(query);
    });

    if (hasDestructive) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Modifying keywords (INSERT, UPDATE, DELETE, DROP, etc.) are restricted." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Run the query against D1
    const result = await env.DB.prepare(query).all();

    return new Response(
      JSON.stringify({
        success: true,
        results: result.results || [],
        meta: result.meta || {}
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
