// FocusConnection
//
// Maintain connection between Focus app and browser extension
// Pass focus/unfocus messages along 
//
function FocusConnection() {

    this.isFocusing = false;
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

    var allowedMsgs = ["focus", "unfocus", "block"];

    var ws = new ReconnectingWebSocket(endpoint);

    this.focus = () => {
        console.log("Focus");
        this.isFocusing = true;
        this.onfocus();
    };

    this.unfocus = function () {
        console.log("Unfocus");
        this.isFocusing = false;
    };

    this.cleanup = function () {
        console.log("Cleanup");
        this.isFocusing = false;
    };

    this.check = function (tabId, url) {
        if (!this.isFocusing) return false;
        ws.send(JSON.stringify({
            "msg": "check",
            "tabId": tabId,
            "url": url
        }));
    };

    ws.ping = function () {
        console.log("Sending ping to Focus");
        ws.send(JSON.stringify({
            "msg": "ping",
            "platform": self.platform,
            "version": self.version
        }));
    };

    ws.onopen = function () {
        console.log("Websocket is open");
        ws.ping();
    }

    ws.onerror = function (err) {
        console.log("Websocket error: " + err);
        self.port = self.port - 1;
        if (self.port < self.min_port) {
            self.port = self.max_port;
        }
        endpoint = get_endpoint();
        ws.URL = endpoint;
        self.cleanup();
    };

    ws.onclose = function () {
        console.log("Websocket is closed");
        self.cleanup();
    };

    ws.onmessage = function (evt) {
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
