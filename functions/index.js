// Cloudflare Pages Function: call Firestore REST to read a document.
// Configure these Variables in Cloudflare Pages -> Settings -> Variables:
// - FIRESTORE_PROJECT: your GCP project id
// - FIRESTORE_TOKEN: optional short-lived access token (for testing)
// - TOKEN_PROVIDER_URL: optional URL to a token-provider service like https://token-provider-XYZ.a.run.app

export async function onRequest(context) {
  const env = context.env || {};
  const project = env.FIRESTORE_PROJECT || "YOUR_PROJECT_ID";
  let token = env.FIRESTORE_TOKEN;
  const tokenProviderUrl = env.TOKEN_PROVIDER_URL;

  if (!token) {
    if (tokenProviderUrl) {
      try {
        const tokRes = await fetch(`${tokenProviderUrl.replace(/\/\$/, '')}/token`);
        if (!tokRes.ok) {
          const text = await tokRes.text();
          return new Response(JSON.stringify({ error: "Token provider returned non-OK", status: tokRes.status, body: text }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        const json = await tokRes.json();
        token = json.token;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to fetch token provider", message: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "FIRESTORE_TOKEN missing and TOKEN_PROVIDER_URL not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/testCollection/doc1`;

  try {
    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}