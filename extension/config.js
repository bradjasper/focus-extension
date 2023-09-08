const vendor = (BrowserDetect.browser == "Firefox" ? browser : chrome);
const manifestData = vendor.runtime.getManifest();
const version = manifestData.version;

var config = {};
config.version = version;
config.min_port = 8913;
config.max_port = 8918;
config.host_local = "localhost";
config.browser = BrowserDetect.browser;
config.block_urls = [
    "http://localhost:8919/block/",
    "http://localhost:8920/block/",
    "http://localhost:8921/block/",
    "http://localhost:8922/block/",
    "http://localhost:8923/block/",
    "http://localhost:8924/block/",
    "http://localhost:8925/block/",
];
