var vendor = getBrowserType();

var conn = new FocusConnection();
conn.version = config.version;
conn.platform = BrowserDetect.browser;

var isWhitelist = false;
var isFocusing = false;
var enableCloseBrowserTabs = false;
var redirectURL;
var regexSites = [];
var compiledRegexSites = [];

function reset() {
    isWhitelist = false;
    isFocusing = false;
    regexSites = [];
    compiledRegexSites = [];
}

conn.focus = function (data) {

    regexSites = [];
    compiledRegexSites = [];

    if (!data.regexSites || data.regexSites.length == 0) {
        return;
    }

    console.log("Focusing");

    isWhitelist = data.whitelist;
    regexSites = data.regexSites;
    compiledRegexSites = compileRegexSites(data.regexSites);
    isFocusing = true;
    enableCloseBrowserTabs = data.enableCloseBrowserTabs;
    redirectURL = data.redirectURL;

    var filters = { urls: ["<all_urls>"], types: ["main_frame", "sub_frame"] };
    var extraInfoSpec = ["blocking"];

    reloadShouldBeBlockedPages(compiledRegexSites);

    processTabs();
};

conn.unfocus = function () {
    console.log("Unfocusing");
    reset();
    reloadBlockedPages();
};

conn.cleanup = function () {
    console.log("Cleaning up request handler");
    reset();
};

conn.connect();

function handleBeforeNavigate(navDetails) {
    if (!isFocusing) { return }
    //console.log("handleBeforeNavigate");

    if (navDetails.frameId == 0) {
        checkTabURL(navDetails.tabId, navDetails.url);
    }
}

function processTabs() {
    //console.log("processTabs");

    vendor.tabs.query({}, function (tabs) {
        if (vendor.runtime.lastError) {
            console.log("error fetching tabs", error);
            return;
        }

        for (let tab of tabs) {
            checkTabURL(tab.id, tab.url);
        }
    });
}

function checkTabURL(tabId, url) {
    if (url.indexOf("about:") == 0) {
        return false;
    }

    if (urlIsBlocked(url, compiledRegexSites, isWhitelist)) {
        if (enableCloseBrowserTabs) {
            chrome.tabs.remove(tabId);
        } else {
            var blockURL = chrome.extension.getURL('/block.html');
            var newURL = `${blockURL}?url=${encodeURIComponent(url)}`;
            chrome.tabs.update(tabId, { url: newURL });
        }
        return true;
    }
}

vendor.webNavigation.onBeforeNavigate.addListener(handleBeforeNavigate);

