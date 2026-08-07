# End-to-end optimized solution: Daily loyalty Journey

This is the default “optimized architecture” when you need reliable, scalable campaign sends.

## Business goal

Each day, enter **active, marketable loyalty members who engaged in the last 24 hours** into a Journey with personalization by tier/locale — without rebuilding the full contact table.

## Architecture

```
CRM / Engagement feed
        │
        ▼
[Import / API] → Contacts_Staging
        │
        ▼
SQL dedupe → Contacts_Gold (Update, PK SubscriberKey)
        │
        ├── update ETL_Watermark
        │
        ▼
SQL gate (watermark fresh?)
        │
        ▼
SQL incremental audience → Audience_Loyalty_Daily
        │   (join gold + last-day engagement + not in Suppression_Global)
        ▼
Journey Entry Source = Audience_Loyalty_Daily
        │
        ├── Email uses AMPscript single LookupRows(Loyalty_Profile)
        │   OR better: attributes already on Entry DE
        ▼
Send Log / Engagement back to reporting DE (bounded _Sent/_Open)
```

## Why this is optimized

| Layer | Choice | Benefit |
|-------|--------|---------|
| Data | Staging ≠ Gold; PK on gold | No duplicate Contact keys |
| SQL | Incremental 1-day window | Minutes vs hours |
| Gate | Watermark check | No Journey on stale ETL |
| Journey | Pre-built Entry DE | Fast evaluation |
| AMPscript | Entry attributes first | Fewer DE hits at send |
| Ops | Error_Log + Automation notify | Visible failures |

## Implementation order

1. Create DEs from [`../data-model/de-schemas.md`](../data-model/de-schemas.md).
2. Deploy SQL from [`../sql/01-incremental-audience.sql`](../sql/01-incremental-audience.sql) + [`../sql/03-dedupe-latest.sql`](../sql/03-dedupe-latest.sql).
3. Add [`../automation/watermark-gate.sql`](../automation/watermark-gate.sql) before Journey-related steps.
4. Personalize with [`../ampscript/01-profile-lookup-cached.ampscript`](../ampscript/01-profile-lookup-cached.ampscript) (or flatten onto Entry DE).
5. Optional async integrations: [`../ssjs/02-queue-processor.js`](../ssjs/02-queue-processor.js).

## Acceptance tests

- Row count `Audience_Loyalty_Daily` ≈ distinct engagers ∩ marketable (spot-check sample).
- Re-running SQL Update does not create duplicates (PK).
- Stopping ETL causes gate to block activation.
- Email preview resolves FirstName/Tier under 2 DE lookups max.
- Automation failure sends notification.
