# Optimized SSJS (CloudPages, Script Activities, Code Resources)

Prefer **WSProxy batched calls** and **prep data in SQL**. Use SSJS for orchestration, APIs, and rows that SQL cannot handle.

## Anti-patterns → Fix

| Anti-pattern | Fix |
|--------------|-----|
| `Rows.Retrieve` in a `for` loop updating one row | `WSProxy.updateItem` / `updateBatch` |
| New auth token inside every iteration | Token once per execution; cache in DE for multi-step |
| Processing 100k rows in one Script Activity | Chunk with Query Activity batches + state DE |
| Core library for bulk DE writes | Platform.Function / WSProxy |
| Silent `catch` with empty body | Write to `Error_Log` DE + rethrow / flag |

---

## Pattern A — WSProxy batch upsert

```javascript
<script runat="server">
Platform.Load("Core", "1.1.1");

var prox = new Script.Util.WSProxy();
var batch = [];
var results;

// Build batch (max practical ~50–100 per call depending on payload)
for (var i = 0; i < records.length; i++) {
  batch.push({
    SubscriberKey: records[i].SubscriberKey,
    Status: records[i].Status,
    ModifiedDate: new Date()
  });

  if (batch.length === 50 || i === records.length - 1) {
    results = prox.updateBatch("DataExtensionObject[Audience_Flags]", batch);
    // inspect results[j].StatusCode
    batch = [];
  }
}
</script>
```

---

## Pattern B — Script Activity: process queue with watermark

1. SQL loads `API_Queue` where `Status = 'PENDING'` (limit via staging).
2. SSJS reads queue, calls external API in batches, upserts results.
3. SSJS marks rows `DONE` / `ERROR`.
4. Automation repeats until queue empty or max iterations.

---

## Pattern C — CloudPage: validate early

```javascript
<script runat="server">
Platform.Load("Core", "1.1.1");

var sk = Request.GetQueryStringParameter("sk");
if (!sk) {
  Write("Missing subscriber");
  // stop — do not call APIs
} else {
  // single LookupRows / WSProxy retrieve
}
</script>
```

---

## Checklist

- [ ] Batch size defined (not 1)
- [ ] Errors written to logging DE
- [ ] No token request per row
- [ ] Large transforms done in Query Activities first
- [ ] Timeouts considered for CloudPage UX (async Journey API when possible)

## Files

- [`01-wsproxy-batch-upsert.js`](01-wsproxy-batch-upsert.js)
- [`02-queue-processor.js`](02-queue-processor.js)
- [`03-error-logger.js`](03-error-logger.js)
