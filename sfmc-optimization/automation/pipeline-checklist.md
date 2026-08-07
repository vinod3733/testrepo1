# Automation pipeline checklist

## Before go-live

- [ ] Every target DE has Primary Key documented
- [ ] Data Action (Update vs Overwrite) chosen deliberately per step
- [ ] Incremental watermark column identified (`ModifiedDate` / `LastSyncUtc`)
- [ ] Journey Entry source is the **final** audience DE, not staging
- [ ] Suppression DE applied (unsubs, complaints, legal holds)
- [ ] Parallel steps have no write conflicts on the same DE
- [ ] Notification email on failure
- [ ] Runbook: how to re-run from step N safely

## After first production runs

- [ ] Measure Query Activity durations (baseline)
- [ ] Confirm row counts vs source system (± tolerance)
- [ ] Confirm no duplicate sends for re-entry scenarios
- [ ] Purge/retention job scheduled for staging DEs
- [ ] Document owner + on-call for the Automation
