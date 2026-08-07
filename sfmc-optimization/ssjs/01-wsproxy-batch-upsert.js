<script runat="server">
Platform.Load("Core", "1.1.1");

/**
 * Optimized WSProxy batch upsert into a Data Extension.
 * DE Customer Key: Audience_Flags
 * PK: SubscriberKey
 *
 * Replace `sourceRows` with LookupRows / API payload as needed.
 */
(function () {
  var prox = new Script.Util.WSProxy();
  var customerKey = "Audience_Flags";
  var dePath = "DataExtensionObject[" + customerKey + "]";
  var batchSize = 50;

  // Example source — replace with real retrieve
  var sourceRows = [
    { SubscriberKey: "001", Status: "Active" },
    { SubscriberKey: "002", Status: "Active" }
  ];

  var batch = [];
  var success = 0;
  var failed = 0;

  function flush(batchRows) {
    if (!batchRows.length) return;

    var payload = [];
    for (var i = 0; i < batchRows.length; i++) {
      payload.push({
        SubscriberKey: batchRows[i].SubscriberKey,
        Status: batchRows[i].Status,
        ModifiedDate: new Date()
      });
    }

    var res = prox.updateBatch(dePath, payload);
    for (var j = 0; j < res.length; j++) {
      if (res[j].StatusCode === "OK") success++;
      else failed++;
    }
  }

  for (var r = 0; r < sourceRows.length; r++) {
    batch.push(sourceRows[r]);
    if (batch.length === batchSize || r === sourceRows.length - 1) {
      flush(batch);
      batch = [];
    }
  }

  Write("Upsert complete. success=" + success + " failed=" + failed);
})();
</script>
