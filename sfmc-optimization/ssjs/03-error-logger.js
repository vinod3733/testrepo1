<script runat="server">
Platform.Load("Core", "1.1.1");

/**
 * Shared error logger — call from Script Activities / CloudPages.
 * DE: Error_Log (add rows; PK = LogId as GUID text, or use non-sendable without PK carefully)
 * Recommended columns:
 *  LogId (Text 36) PK
 *  Component (Text 100)
 *  Message (Text 4000)
 *  Detail (Text 4000)
 *  CreatedDate (Date)
 */
function logError(component, message, detail) {
  var prox = new Script.Util.WSProxy();
  var guid = Platform.Function.GUID();

  prox.createItem("DataExtensionObject[Error_Log]", {
    LogId: guid,
    Component: String(component || "unknown").substring(0, 100),
    Message: String(message || "").substring(0, 4000),
    Detail: String(detail || "").substring(0, 4000),
    CreatedDate: new Date()
  });

  return guid;
}

// Example usage:
try {
  // riskyOperation();
} catch (e) {
  logError("Script.QueueProcessor", e.message || e, e);
  Write("ERROR_LOGGED");
}
</script>
