# API & Integration Optimization

Apply when using SFMC REST/SOAP, Journey Events, Triggered Sends, or external ETL.

## Anti-patterns → Fix

| Anti-pattern | Fix |
|--------------|-----|
| Request OAuth token every API call | Cache token until ~expiry − 5 minutes |
| Inject Journey contacts one-by-one synchronously from UI thread | Bulk insert to DE + Automation, or batch events |
| Huge synchronous CloudPage → CRM round trip | Queue DE + async Script Activity |
| Ignoring 429 Retry-After | Exponential backoff with jitter |
| Shared Client Id/Secret in Content Builder | Use Server-to-Server Installed Package; secrets in secure config |

---

## Auth (Server-to-Server)

```http
POST https://YOUR_SUBDOMAIN.auth.marketingcloudapis.com/v2/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "{{CLIENT_ID}}",
  "client_secret": "{{CLIENT_SECRET}}"
}
```

Cache `access_token` + `expires_in`. Reuse across the process.

---

## Preferred integration styles

### A. Bulk data → SFMC (best for campaigns)
External system → SFTP / API Data Extension rows → Automation SQL → Journey Entry.

### B. Near real-time 1:1
Journey Builder API Events or Triggered Send Definition — **batch** where SDK allows.

### C. Mid-journey external decision
Use **Journey Activity (custom)** or precompute flags into Entry / Contact attributes. Avoid CloudPage as a decision engine for millions of rows.

---

## Batching guidance

| Operation | Practical batch |
|-----------|-----------------|
| DE row upsert (REST/SOAP) | 50–100+ rows/request (test limits) |
| Async queue processing (SSJS) | 50–200 rows/Script run |
| Journey entry via DE | Prefer DE audience over per-contact API when volumes are high |

---

## Security & compliance checklist

- [ ] Installed Package scopes least-privilege (only needed DE / journeys)
- [ ] Separate packages for prod vs sandbox BU when possible
- [ ] No secrets in emails, CloudPage HTML, or Git without vaulting
- [ ] Honor consent flags before any send API
- [ ] Log correlation IDs into `Error_Log` / custom send log

## Files

- [`oauth-token-cache.example.js`](oauth-token-cache.example.js)
- [`journey-event-inject.example.js`](journey-event-inject.example.js)
