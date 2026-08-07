# Data Model Optimization

Most SFMC performance issues are **data model** issues wearing a SQL costume.

## Rules

1. **Every production DE used in joins/sends needs a Primary Key.**
2. **Sendable DEs**: Subscriber Key relationship configured; Email Address present.
3. **Separate staging vs gold.** Staging can be messy; gold is deduped and typed.
4. **Retention on high-churn DEs** (queues, staging, logs).
5. **Prefer narrow sendable projections** — only attributes the Journey/email needs.

---

## Recommended DE set

| DE | Purpose | PK | Retention |
|----|---------|----|-----------|
| `Contacts_Gold` | Master profile | `SubscriberKey` | Permanent (with legal purge process) |
| `Contacts_Staging` | Raw import | composite or none → dedupe in SQL | 7–14 days |
| `Audience_<Campaign>` | Journey entry | `SubscriberKey` | 30–90 days |
| `Suppression_Global` | Do-not-contact | `SubscriberKey` | Permanent |
| `ETL_Watermark` | Pipeline freshness | `PipelineName` | Permanent |
| `API_Queue` | Async work | `QueueId` | 14–30 days |
| `Error_Log` | Ops | `LogId` | 30–90 days |
| `Send_Log` / custom | Audit | `SendLogId` or Job+SubKey | per compliance |

---

## Field design tips

- Use **Text (254)** for SubscriberKey unless your model requires longer (then stay consistent).
- Store **booleans as Text/Number flags** (`IsMarketable = 1`) for easy SQL filters.
- Persist **Locale**, **Timezone**, **ConsentDate**, **SourceSystem** on gold profile.
- Avoid multi-purpose “JSON blob” columns for Journey decisions — flatten keys you filter on.

---

## Relationship / Contact Builder

- Map `SubscriberKey` → Contact Key consistently across BU.
- Do not create circular Attribute Group spaghetti; keep paths short for Journey filters.
- Populations: use only if you understand evaluation cost; prefer filtered DEs for entry.

## Files

- [`de-schemas.md`](de-schemas.md)
