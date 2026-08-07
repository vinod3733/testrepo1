/*==============================================================================
  Pattern: Bounded system data view — 7-day send + open flag
  Target DE: Reporting_SentOpen_7d
  Data Action: Overwrite
  Note: Always bound _Sent / _Open by EventDate
==============================================================================*/

SELECT
    s.AccountID,
    s.OYBAccountID,
    s.JobID,
    s.ListID,
    s.BatchID,
    s.SubscriberKey,
    s.EmailAddress,
    s.SubscriberID,
    s.EventDate AS SentDate,
    CASE WHEN o.SubscriberKey IS NOT NULL THEN 1 ELSE 0 END AS HasOpen
FROM _Sent AS s
LEFT JOIN (
    SELECT DISTINCT
        SubscriberKey,
        JobID,
        BatchID,
        ListID
    FROM _Open
    WHERE EventDate >= DATEADD(day, -7, GETDATE())
) AS o
    ON  s.SubscriberKey = o.SubscriberKey
    AND s.JobID = o.JobID
    AND s.BatchID = o.BatchID
    AND s.ListID = o.ListID
WHERE s.EventDate >= DATEADD(day, -7, GETDATE());
