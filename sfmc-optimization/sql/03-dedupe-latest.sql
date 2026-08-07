/*==============================================================================
  Pattern: Latest-row dedupe from staging → gold
  Source: Preference_Staging (may contain duplicate SubscriberKey)
  Target: Preference_Gold (PK: SubscriberKey)
  Data Action: Update
==============================================================================*/

SELECT
    x.SubscriberKey,
    x.EmailAddress,
    x.PreferenceFlag,
    x.SourceSystem,
    x.ModifiedDate
FROM (
    SELECT
        SubscriberKey,
        EmailAddress,
        PreferenceFlag,
        SourceSystem,
        ModifiedDate,
        ROW_NUMBER() OVER (
            PARTITION BY SubscriberKey
            ORDER BY ModifiedDate DESC
        ) AS rn
    FROM Preference_Staging
) AS x
WHERE x.rn = 1;
