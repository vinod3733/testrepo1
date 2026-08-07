/*==============================================================================
  Pattern: Incremental marketable audience (last 1 day engagers)
  Target DE: Audience_Incremental
    - SubscriberKey (Text 254) PK
    - EmailAddress (Email)
    - Locale (Text 10)
    - LoyaltyTier (Text 50)
    - LastEngagementDate (Date)
  Data Action: Update
  Automation: Daily after engagement sync
==============================================================================*/

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
  AND s.EmailAddress IS NOT NULL
  AND s.IsMarketable = 1;
