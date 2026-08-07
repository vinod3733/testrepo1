/*==============================================================================
  Watermark gate — run before Journey audience activation
  Target DE: Pipeline_Gate (PK: PipelineName) — Overwrite
  If this DE has 0 rows, do not proceed (configure dependent steps / verification)
==============================================================================*/

SELECT
    w.PipelineName,
    w.LastSuccessUTC,
    'READY' AS GateStatus
FROM ETL_Watermark AS w
WHERE w.PipelineName = 'Contacts_Gold'
  AND w.LastSuccessUTC >= DATEADD(hour, -6, GETDATE());
