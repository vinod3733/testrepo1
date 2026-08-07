# Reference Data Extension schemas

Use these as a starting blueprint. Adjust lengths to your org standards.

## Contacts_Gold (sendable)

| Column | Type | Len | PK | Notes |
|--------|------|-----|----|-------|
| SubscriberKey | Text | 254 | Y | Contact Key |
| EmailAddress | Email | | | Required for sendable |
| FirstName | Text | 100 | | |
| Locale | Text | 10 | | e.g. en-US |
| IsMarketable | Number | | | 1/0 |
| Status | Text | 50 | | Active/Unsub |
| ModifiedDate | Date | | | Watermark source |
| SourceSystem | Text | 50 | | CRM / ecom / etc. |

## Audience_Incremental (Journey entry)

| Column | Type | Len | PK | Notes |
|--------|------|-----|----|-------|
| SubscriberKey | Text | 254 | Y | |
| EmailAddress | Email | | | |
| Locale | Text | 10 | | |
| LoyaltyTier | Text | 50 | | |
| LastEngagementDate | Date | | | |

## Suppression_Global

| Column | Type | Len | PK | Notes |
|--------|------|-----|----|-------|
| SubscriberKey | Text | 254 | Y | |
| Reason | Text | 100 | | legal / bounce / complaint |
| CreatedDate | Date | | | |

## ETL_Watermark

| Column | Type | Len | PK | Notes |
|--------|------|-----|----|-------|
| PipelineName | Text | 100 | Y | |
| LastSuccessUTC | Date | | | |
| RowCountSnapshot | Number | | | optional |

## API_Queue

| Column | Type | Len | PK | Notes |
|--------|------|-----|----|-------|
| QueueId | Text | 36 | Y | GUID |
| SubscriberKey | Text | 254 | | |
| Payload | Text | 4000 | | or use longer via design |
| Status | Text | 20 | | PENDING/DONE/ERROR |
| Attempts | Number | | | |
| LastError | Text | 4000 | | |
| ModifiedDate | Date | | | |

## Error_Log

| Column | Type | Len | PK | Notes |
|--------|------|-----|----|-------|
| LogId | Text | 36 | Y | GUID |
| Component | Text | 100 | | |
| Message | Text | 4000 | | |
| Detail | Text | 4000 | | |
| CreatedDate | Date | | | |
