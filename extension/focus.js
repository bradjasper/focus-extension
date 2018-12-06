var vendor = getBrowserType();

var conn = new FocusConnection();
conn.version = config.version;
conn.platform = BrowserDetect.browser;

var isFocusing = false;
var enableCloseBrowserTabs = false;
var redirectURL;
var regexSites = [];
var compiledRegexSites = [];

function onBeforeRequestHandler(info) {
    if (info.url.indexOf("?focus_url=") != -1) {
        return {};
    }

    if (urlIsBlocked(info.url, compiledRegexSites)) {
        if (enableCloseBrowserTabs) {
            chrome.tabs.remove(info.tabId);
        } else {
            var url = redirectURL + "?focus_url=" + encodeURIComponent(info.url);
            return {redirectUrl: url};
        }
    }
}

function reset() {
    isFocusing = false;
    regexSites = [];
    compiledRegexSites = [];
    vendor.webRequest.onBeforeRequest.removeListener(onBeforeRequestHandler);
}

conn.focus = function(data) {
    vendor.webRequest.onBeforeRequest.removeListener(onBeforeRequestHandler);

    regexSites = [];
    compiledRegexSites = [];

    if (!data.regexSites || data.regexSites.length == 0) {
        return;
    }

    console.log("Focusing");
    regexSites = data.regexSites;
    compiledRegexSites = compileRegexSites(data.regexSites);
    isFocusing = true;
    enableCloseBrowserTabs = data.enableCloseBrowserTabs;
	redirectURL = data.redirectURL;

    var filters = {urls: ["<all_urls>"], types: ["main_frame", "sub_frame"]};
    var extraInfoSpec = ["blocking"];
    vendor.webRequest.onBeforeRequest.addListener(onBeforeRequestHandler, filters, extraInfoSpec);

    reloadShouldBeBlockedPages(compiledRegexSites);
};

conn.unfocus = function() {
    console.log("Unfocusing");
    reset();
    reloadBlockedPages();
};

conn.cleanup = function() {
    console.log("Cleaning up request handler");
    reset();
};

conn.connect();

