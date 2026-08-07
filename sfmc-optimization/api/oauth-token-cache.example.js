/**
 * Example: OAuth token cache pattern for external Node (or similar) integrations.
 * Do NOT store client secrets in SFMC content. Prefer middleware / middleware vault.
 *
 * For in-SFMC SSJS calling external APIs, store tokens in a protected DE with expiry
 * and refresh only when needed (single-flight refresh).
 */

let cached = { accessToken: null, expiresAt: 0 };

async function getToken(authBaseUrl, clientId, clientSecret) {
  const now = Date.now();
  if (cached.accessToken && now < cached.expiresAt) {
    return cached.accessToken;
  }

  const res = await fetch(`${authBaseUrl}/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status}`);
  }

  const data = await res.json();
  // Refresh 5 minutes early
  cached = {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in - 300) * 1000
  };
  return cached.accessToken;
}

module.exports = { getToken };
