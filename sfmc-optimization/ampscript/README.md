# Optimized AMPscript

Goal: **one DE round-trip per content need**, not one lookup per attribute.

## Anti-patterns → Fix

| Anti-pattern | Cost | Fix |
|--------------|------|-----|
| `Lookup` called 8 times for same row | 8 DE hits | One `LookupRows` + `Field()` |
| `LookupRows` inside a huge loop with no limit | Timeout | Cap rows; pre-aggregate in SQL |
| Personalization strings built with nested IIF hell | Unreadable + slow | Set vars once; use `IF/ELSEIF` blocks |
| Hitting linked DEs at send time for filters | Send-time drag | Move filters to Query Activity |

---

## Pattern A — Single-row cache (best default)

```ampscript
%%[
VAR @sk, @rows, @row, @firstName, @tier, @points

SET @sk = AttributeValue("SubscriberKey")
IF Empty(@sk) THEN SET @sk = subscriberkey ENDIF

SET @rows = LookupRows("Loyalty_Profile", "SubscriberKey", @sk)
IF RowCount(@rows) > 0 THEN
  SET @row = Row(@rows, 1)
  SET @firstName = Field(@row, "FirstName")
  SET @tier = Field(@row, "Tier")
  SET @points = Field(@row, "Points")
ELSE
  SET @firstName = "there"
  SET @tier = "Member"
  SET @points = "0"
ENDIF
]%%

Hi %%=v(@firstName)=%% — you're on %%=v(@tier)=%% with %%=v(@points)=%% points.
```

---

## Pattern B — Fallback chain without extra lookups

```ampscript
%%[
SET @displayName = AttributeValue("FirstName")
IF Empty(@displayName) THEN SET @displayName = AttributeValue("FullName") ENDIF
IF Empty(@displayName) THEN SET @displayName = "there" ENDIF
]%%
```

Use sendable / Journey entry attributes first; Lookup only for data **not** on the send context.

---

## Pattern C — Content block: promo by locale (pre-keyed)

Assume SQL built `Promo_Today` with PK `Locale`.

```ampscript
%%[
SET @locale = AttributeValue("Locale")
IF Empty(@locale) THEN SET @locale = "en-US" ENDIF

SET @rows = LookupRows("Promo_Today", "Locale", @locale)
IF RowCount(@rows) == 0 THEN
  SET @rows = LookupRows("Promo_Today", "Locale", "en-US")
ENDIF

IF RowCount(@rows) > 0 THEN
  SET @row = Row(@rows, 1)
  SET @headline = Field(@row, "Headline")
  SET @ctaUrl = Field(@row, "CtaUrl")
ENDIF
]%%
```

---

## Pattern D — Avoid send-time exclusion logic in AMPscript

Do **not** use AMPscript to decide “should this person get the email?” at scale.  
Do that in **SQL / Exclusion scripts / Journey Decision Split** on precomputed flags.

AMPscript exclusion scripts are OK for light rules; heavy DE scans belong in Automation Studio.

---

## Checklist

- [ ] Attributes available on sendable DE / Journey are used before Lookup
- [ ] Max one `LookupRows` per related DE per email
- [ ] Empty/null defaults set once
- [ ] No nested Lookup inside FOR loops over large sets
- [ ] Dynamic content keys precomputed in SQL when possible

## Files

- [`01-profile-lookup-cached.ampscript`](01-profile-lookup-cached.ampscript)
- [`02-promo-by-locale.ampscript`](02-promo-by-locale.ampscript)
