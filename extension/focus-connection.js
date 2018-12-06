// FocusConnection
//
// Maintain connection between Focus app and browser extension
// Pass focus/unfocus messages along 
//
function FocusConnection() {

    this.version = "0.0";
    this.platform = "unknown";
    this.min_port = config.min_port;
    this.max_port = config.max_port;
    this.port = config.max_port;

    var self = this;

    function get_endpoint() {
        return "ws://" + config.host_local + ":" + self.port + "/" + config.browser;
    }

    var endpoint = get_endpoint();

    console.log("Creating new Focus connection to " + endpoint);

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
        self.port = self.port - 1;
        if (self.port < self.min_port) {
            self.port = self.max_port;
        }
        endpoint = get_endpoint();
        ws.URL = endpoint;
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
