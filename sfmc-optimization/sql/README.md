# Optimized SQL Query Activities

SFMC SQL is T-SQL–like with account-specific limits. Optimization usually means **less data moved**, not clever syntax.

## Anti-patterns → Fix

| Anti-pattern | Why it hurts | Optimized approach |
|--------------|--------------|--------------------|
| Nightly `SELECT *` rebuild of 50M-row DE | Full scan + write contention | Incremental watermark upsert |
| Joining two huge DEs without date filter | Timeout / long lock | Filter each side first (CTE/subquery), then join |
| `WHERE Email LIKE '%@domain.com'` | Non-sargable | Use domain column or `RIGHT`/`CHARINDEX` carefully; prefer stored domain |
| Many `OR` predicates | Poor plan | `UNION ALL` of selective branches |
| `DISTINCT` to hide bad joins | Hides Cartesian product | Fix join keys; use `EXISTS` |
| Query feeds Journey with unneeded columns | Inflates payload | Project only Journey attributes |

---

## Pattern A — Incremental audience (watermark)

**Use when:** Daily Journey / send audience that changes by activity or preference updates.

```sql
/* Target: Audience_Incremental (PK: SubscriberKey) — Update Type: Update */
SELECT
    s.SubscriberKey,
    s.EmailAddress,
    s.Locale,
    s.LoyaltyTier,
    a.LastEngagementDate
FROM Ent.Subscribers_Master AS s
INNER JOIN (
    SELECT
        SubscriberKey,
        MAX(EventDate) AS LastEngagementDate
    FROM Engagement_Events
    WHERE EventDate >= DATEADD(day, -1, CAST(GETDATE() AS date))
    GROUP BY SubscriberKey
) AS a
    ON s.SubscriberKey = a.SubscriberKey
WHERE s.Status = 'Active'
  AND s.EmailAddress IS NOT NULL;
```

**Companion — watermark control DE** (`ETL_Watermark`, PK: `PipelineName`):

```sql
/* After successful load — Update Type: Update */
SELECT
    'Audience_Incremental' AS PipelineName,
    GETDATE() AS LastSuccessUTC,
    (SELECT COUNT(*) FROM Audience_Incremental) AS RowCountSnapshot;
```

---

## Pattern B — Filter-then-join (avoid big × big)

```sql
/* BAD: join full history to full master */
/* SELECT ... FROM Master m JOIN Clicks c ON m.SubscriberKey = c.SubscriberKey */

/* GOOD: shrink clicks first */
WITH RecentClicks AS (
    SELECT
        SubscriberKey,
        COUNT(*) AS ClickCount7d
    FROM _Click
    WHERE EventDate >= DATEADD(day, -7, GETDATE())
      AND IsUnique = 1
    GROUP BY SubscriberKey
)
SELECT
    m.SubscriberKey,
    m.EmailAddress,
    r.ClickCount7d
FROM Master_Customers AS m
INNER JOIN RecentClicks AS r
    ON m.SubscriberKey = r.SubscriberKey
WHERE m.IsMarketable = 1;
```

---

## Pattern C — `EXISTS` instead of `IN` / join-for-filter

```sql
SELECT
    m.SubscriberKey,
    m.EmailAddress
FROM Master_Customers AS m
WHERE m.IsMarketable = 1
  AND EXISTS (
      SELECT 1
      FROM Purchases AS p
      WHERE p.SubscriberKey = m.SubscriberKey
        AND p.PurchaseDate >= DATEADD(day, -30, GETDATE())
  );
```

---

## Pattern D — Deduplicate safely (latest row wins)

```sql
SELECT
    x.SubscriberKey,
    x.EmailAddress,
    x.PreferenceFlag,
    x.ModifiedDate
FROM (
    SELECT
        SubscriberKey,
        EmailAddress,
        PreferenceFlag,
        ModifiedDate,
        ROW_NUMBER() OVER (
            PARTITION BY SubscriberKey
            ORDER BY ModifiedDate DESC
        ) AS rn
    FROM Preference_Staging
) AS x
WHERE x.rn = 1;
```

Target DE PK = `SubscriberKey`, Update Type = **Update** (upsert).

---

## Pattern E — System data views (bounded)

Always bound `_Sent`, `_Open`, `_Click`, `_Bounce`, `_Complaint`, `_Unsubscribe`.

```sql
SELECT
    s.SubscriberKey,
    s.JobID,
    s.EventDate AS SentDate,
    CASE WHEN o.SubscriberKey IS NOT NULL THEN 1 ELSE 0 END AS Opened
FROM _Sent AS s
LEFT JOIN (
    SELECT DISTINCT SubscriberKey, JobID
    FROM _Open
    WHERE EventDate >= DATEADD(day, -7, GETDATE())
) AS o
    ON s.SubscriberKey = o.SubscriberKey
   AND s.JobID = o.JobID
WHERE s.EventDate >= DATEADD(day, -7, GETDATE());
```

---

## Query Activity settings checklist

- [ ] Target DE has a **Primary Key**
- [ ] Data Action: **Update** for incremental; **Overwrite** only for small rebuilds / staging
- [ ] Column list matches target (no silent truncates)
- [ ] Date filters on event/system views
- [ ] Run off-peak if full scan is unavoidable
- [ ] Dependent Automation steps wait on this query

## Files in this folder

- [`01-incremental-audience.sql`](01-incremental-audience.sql)
- [`02-filter-then-join.sql`](02-filter-then-join.sql)
- [`03-dedupe-latest.sql`](03-dedupe-latest.sql)
- [`04-engagement-7d.sql`](04-engagement-7d.sql)
