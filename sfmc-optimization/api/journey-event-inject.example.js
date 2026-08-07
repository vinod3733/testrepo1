/**
 * Example: Journey API event injection with simple retry/backoff.
 * Replace EVENT_DEFINITION_KEY and endpoint with your BU values.
 *
 * For high volume, prefer loading a Data Extension + Automation entry source.
 */

async function injectJourneyEvent(restBaseUrl, token, eventDefinitionKey, contactKey, data) {
  const url = `${restBaseUrl}/interaction/v1/events`;
  const body = {
    ContactKey: contactKey,
    EventDefinitionKey: eventDefinitionKey,
    Data: data || {}
  };

  let attempt = 0;
  const maxAttempts = 5;

  while (attempt < maxAttempts) {
    attempt++;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("Retry-After") || 0);
      const delayMs = retryAfter
        ? retryAfter * 1000
        : Math.min(1000 * Math.pow(2, attempt), 15000) + Math.floor(Math.random() * 250);
      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Journey inject failed: ${res.status} ${text}`);
    }

    return res.json();
  }

  throw new Error("Journey inject exhausted retries");
}

module.exports = { injectJourneyEvent };
