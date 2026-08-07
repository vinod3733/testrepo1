<script runat="server">
Platform.Load("Core", "1.1.1");

/**
 * Queue processor pattern for Automation Studio Script Activity.
 *
 * DE: API_Queue
 *  - QueueId (PK)
 *  - SubscriberKey
 *  - Payload
 *  - Status (PENDING|DONE|ERROR)
 *  - Attempts
 *  - LastError
 *  - ModifiedDate
 *
 * Flow:
 *  1) SQL selects PENDING rows into a small working set (or filter here).
 *  2) This script processes up to MAX_ROWS per run.
 *  3) Automation schedules every N minutes until drained.
 */
(function () {
  var prox = new Script.Util.WSProxy();
  var queueDE = "API_Queue";
  var MAX_ROWS = 100;
  var now = new Date();

  var cols = ["QueueId", "SubscriberKey", "Payload", "Attempts"];
  var filter = {
    Property: "Status",
    SimpleOperator: "equals",
    Value: "PENDING"
  };

  var data = prox.retrieve("DataExtensionObject[" + queueDE + "]", cols, filter);
  if (!data || !data.Results) {
    Write("No queue results");
    return;
  }

  var rows = data.Results;
  var limit = Math.min(rows.length, MAX_ROWS);
  var doneBatch = [];
  var errorBatch = [];

  for (var i = 0; i < limit; i++) {
    var row = rows[i];
    var queueId = row.Properties ? getProp(row, "QueueId") : row.QueueId;
    var sk = row.Properties ? getProp(row, "SubscriberKey") : row.SubscriberKey;
    var attempts = Number(row.Properties ? getProp(row, "Attempts") : row.Attempts) || 0;

    try {
      // TODO: call external API / Journey inject / Triggered Send here
      // processPayload(getProp(row, "Payload"));

      doneBatch.push({
        QueueId: queueId,
        SubscriberKey: sk,
        Status: "DONE",
        Attempts: attempts + 1,
        LastError: "",
        ModifiedDate: now
      });
    } catch (e) {
      errorBatch.push({
        QueueId: queueId,
        SubscriberKey: sk,
        Status: attempts + 1 >= 3 ? "ERROR" : "PENDING",
        Attempts: attempts + 1,
        LastError: String(e).substring(0, 4000),
        ModifiedDate: now
      });
    }
  }

  if (doneBatch.length) prox.updateBatch("DataExtensionObject[" + queueDE + "]", doneBatch);
  if (errorBatch.length) prox.updateBatch("DataExtensionObject[" + queueDE + "]", errorBatch);

  Write("Processed=" + limit + " done=" + doneBatch.length + " errors=" + errorBatch.length);

  function getProp(result, name) {
    var props = result.Properties || [];
    for (var p = 0; p < props.length; p++) {
      if (props[p].Name === name) return props[p].Value;
    }
    return null;
  }
})();
</script>
