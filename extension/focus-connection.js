// FocusConnection
//
// Maintain connection between Focus app and browser extension
// Pass focus/unfocus messages along 
//
function FocusConnection(endpoint) {

  this.version = "0.0";
  this.platform = "unknown";

  console.log("Creating new Focus connection to " + endpoint);

  var self = this;

  var allowedMsgs = ["focus", "unfocus"];

  // Overridden by browser extensions
  this.focus = function() {};
  this.unfocus = function() {};
  this.cleanup = function() {};

  var ws = new ReconnectingWebSocket(endpoint);

  ws.ping = function() {
    console.log("Sending ping to Focus");
    ws.send(JSON.stringify({
      "msg": "ping",
      "platform": self.platform,
      "version": self.version
    }));
  };

  ws.onopen = function() {
    console.log("Websocket is open");
    ws.ping();
  };

  ws.onerror = function(err) {
    console.log("Websocket error: " + err);
    self.cleanup();
  };

  ws.onclose = function() {
    console.log("Websocket is closed");
    self.cleanup();
  };

  ws.onmessage = function(evt) {
    console.log("Received message from server");

    try {
      var data = JSON.parse(evt.data);
    } catch (err) {
      console.log("Error parsing JSON: " + evt.data);
      return;
    }

    if (!data) {
      console.log("Invalid data from server: " + evt.data);
      return;
    }

    if (allowedMsgs.indexOf(data.msg) == -1) {
      console.log("Unknown message: " + evt.data);
      return;
    }

    self[data.msg](data);
  };

  this.connect = ws.connect;

}
