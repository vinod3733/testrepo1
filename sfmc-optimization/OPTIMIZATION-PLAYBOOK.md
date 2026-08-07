# SFMC Optimization Playbook

Use this when something is slow, flaky, or hitting limits. Diagnose first, then apply the matching pattern.

## 1. Diagnose in 5 minutes

| Symptom | Likely cause | Go to |
|---------|--------------|--------|
| Query Activity > 30 min / fails | Full table scans, `SELECT *`, missing filters, Cartesian joins | [`sql/`](sql/) |
| Journey audience building slow | Large entry source rebuilt nightly; too many Decision Splits | [`sql/`](sql/) + [`automation/`](automation/) |
| Email personalization timeouts | Nested `Lookup` / `LookupRows` per row | [`ampscript/`](ampscript/) |
| CloudPage / Code Resource slow | Row-by-row SSJS API calls; no caching | [`ssjs/`](ssjs/) |
| Automation fails overnight | No error path; dependent steps not isolated | [`automation/`](automation/) |
| API 429 / token thrash | New token per request; tiny batches | [`api/`](api/) |
| Duplicate sends / orphan rows | Weak PK; no retention; overlapping automations | [`data-model/`](data-model/) |

## 2. Golden rules

### SQL
- Prefer **filtered incremental** extracts over full DE copies.
- Never `SELECT *` into a sendable DE used by Journeys.
- Put the **most selective filter first** in `WHERE`.
- Avoid `OR` across large columns; use `UNION ALL` of two selective queries instead.
- Cap working sets with date windows (`WHERE EventDate >= DATEADD(day, -7, GETDATE())`).

### Journeys
- Pre-segment in Automation Studio SQL → small Entry DE.
- Keep Decision Splits on **attributes already on the Contact / Entry DE**, not live Lookups when avoidable.
- Use **Journey Settings → Contact Entry** consciously (re-entry rules).

### AMPscript / SSJS
- Prefer **one `LookupRows` + loop** over many `Lookup` calls.
- Use **WSProxy** for DE upserts (batched), not Core library row-by-row.
- On CloudPages: validate early, exit early, never do SOAP in the render path if a Query Activity can prep data.

### Ops
- Every Automation: **starting source → transform → activate → archive/log**.
- Separate **prod vs staging** Business Units; never test sends against production All Subscribers without Exclusion.

## 3. Target SLAs (practical)

| Workload | Healthy target |
|----------|----------------|
| Incremental SQL (≤ 2M filtered rows) | < 15 min |
| Full rebuild (only when required) | Off-peak; document expected duration |
| CloudPage TTFB (personalized) | < 2 s typical |
| Triggered send / Journey API inject | Batch ≥ 50–100; respect account limits |
| Token reuse | Cache until ~expire − 5 min |

## 4. Rollout sequence

1. Fix data model (PK, retention, watermark).
2. Optimize SQL that feeds Journeys / Sends.
3. Simplify Journey graph (fewer live lookups).
4. Batch API / SSJS.
5. Add logging + alerts (failed Automation → notification email / Teams webhook via SSJS).

## 5. Definition of done

- [ ] Query uses incremental watermark or bounded date window
- [ ] No `SELECT *` into production sendable DEs
- [ ] Journey entry volume justified (counts documented)
- [ ] AMPscript/SSJS has no N+1 DE/API pattern
- [ ] Automation has failure notification
- [ ] Retention policy exists on staging/temp DEs
