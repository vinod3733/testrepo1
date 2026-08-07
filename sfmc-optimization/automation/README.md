# Automation Studio — Optimized Orchestration

Design Automations like pipelines: **extract → transform → activate → archive → notify**.

## Reference architecture (daily Journey feed)

```
[1] File Drop / API / Import
        ↓
[2] SQL: Stage sanitize + dedupe
        ↓
[3] SQL: Incremental audience (Update)
        ↓
[4] SQL: Suppression / eligibility flags
        ↓
[5] Journey / Email Send / Wait
        ↓
[6] SQL: Archive + watermark
        ↓
[7] Verification / Alert (SSJS or email)
```

Keep steps **idempotent** where possible so a re-run does not double-send (use send logging + exclusion).

---

## Optimization levers

| Lever | Practice |
|-------|----------|
| Parallelism | Independent SQL steps in **parallel** after shared dependency |
| Serial necessity | Audience build **before** Journey activation / Extract |
| Failure isolation | Critical path vs nice-to-have reporting in separate Automations |
| Schedule | Heavy full scans off-peak; incremental hourly/daily |
| File imports | Delimited, UTF-8, skip bad records to error file when acceptable |
| Notifications | On error → notification email to ops DL |

---

## Pattern — Two-Automation split

1. **ETL_Contacts_Daily** — imports + gold DE upserts + watermark.  
2. **ACT_JourneyAudience_Daily** — depends on watermark “fresh enough”, builds Journey Entry DE.

If ETL fails, activation never runs with stale/partial data (gate with watermark age check SQL).

```sql
/* Gate query — only outputs a row when watermark is fresh */
SELECT 'READY' AS PipelineStatus
FROM ETL_Watermark
WHERE PipelineName = 'Contacts_Gold'
  AND LastSuccessUTC >= DATEADD(hour, -6, GETDATE());
```

Use row count on gate DE: if 0 rows, stop / skip activation (or fail intentionally).

---

## Error handling checklist

- [ ] Automation notification email configured
- [ ] `Error_Log` DE written from Script Activities
- [ ] Temp/staging DEs have retention (e.g. 7–30 days)
- [ ] No overlapping schedules on same target DE without upsert PK
- [ ] File drop Automation has “skip if no file” behavior understood

## Files

- [`pipeline-checklist.md`](pipeline-checklist.md)
- [`watermark-gate.sql`](watermark-gate.sql)
