/*==============================================================================
  Pattern: Filter-then-join — 7-day unique clickers who are marketable
  Target DE: Audience_Clickers_7d (PK: SubscriberKey)
  Data Action: Overwrite (small daily set) OR Update
==============================================================================*/

WITH RecentClicks AS (
    SELECT
        SubscriberKey,
        COUNT(*) AS ClickCount7d,
        MAX(EventDate) AS LastClickDate
    FROM _Click
    WHERE EventDate >= DATEADD(day, -7, GETDATE())
      AND IsUnique = 1
    GROUP BY SubscriberKey
)
SELECT
    m.SubscriberKey,
    m.EmailAddress,
    m.Locale,
    r.ClickCount7d,
    r.LastClickDate
FROM Master_Customers AS m
INNER JOIN RecentClicks AS r
    ON m.SubscriberKey = r.SubscriberKey
WHERE m.IsMarketable = 1
  AND m.EmailAddress IS NOT NULL;
