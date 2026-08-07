# Salesforce Marketing Cloud — Optimized Solutions Kit

Production-ready patterns for SFMC developers: SQL, AMPscript, SSJS, Automation Studio, data model, and API integrations.

## What's inside

| Area | Path | Focus |
|------|------|--------|
| SQL Query Activities | [`sfmc-optimization/sql/`](sfmc-optimization/sql/) | Partition-friendly queries, incremental loads, anti-patterns |
| AMPscript | [`sfmc-optimization/ampscript/`](sfmc-optimization/ampscript/) | Lookup cache, personalization without N+1 DE hits |
| SSJS | [`sfmc-optimization/ssjs/`](sfmc-optimization/ssjs/) | Batch WSProxy, Core vs Platform, CloudPage performance |
| Automation Studio | [`sfmc-optimization/automation/`](sfmc-optimization/automation/) | Orchestration, error handling, SLA design |
| Data Model | [`sfmc-optimization/data-model/`](sfmc-optimization/data-model/) | DE keys, indexes mindset, retention |
| API / Integrations | [`sfmc-optimization/api/`](sfmc-optimization/api/) | Auth, bulk send, event-driven Journeys |

Start with the [optimization playbook](sfmc-optimization/OPTIMIZATION-PLAYBOOK.md).

## How to use

1. Pick the bottleneck (query timeout, Journey lag, CloudPage latency, API limits).
2. Open the matching folder and apply the **Before → After** pattern.
3. Validate with the checklist at the end of each file.

## Design principles (SFMC)

1. **Push work to Query Activities** — filter/join in SQL, not in Journey Decision Splits when possible.
2. **Incremental > full rebuild** — watermark columns (`ModifiedDate`, `RowVersion`) beat nightly full copies.
3. **Batch everything** — WSProxy / SOAP / REST in chunks; never row-by-row in loops at scale.
4. **Primary keys + retention** — every sendable DE needs a stable PK and a retention/purge plan.
5. **Fail visibly** — log Automation errors to a logging DE; do not swallow SSJS exceptions.
