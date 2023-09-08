const blockURL = vendor.extension.getURL("/block.html");

const conn = new FocusConnection();
conn.version = config.version;
conn.platform = BrowserDetect.browser;



function processFrontmostTab() {
    console.log("Processing front-most tab");
    vendor.windows.getCurrent({ populate: true }, function (currentWindow) {
        for (var i = 0; i < currentWindow.tabs.length; i++) {
            const tab = currentWindow.tabs[i];
            if (tab.active) {
                processTab(tab.id, tab.url);
                break;
            }
        }
    });
}

function handleBeforeNavigate(navDetails) {
    if (!conn.isFocusing) { return }

    if (navDetails.frameId == 0) {
        processTab(navDetails.tabId, navDetails.url);
    }
}

function convertRedirectURLToLocalTemplate(redirectURL) {
    const url = new URL(redirectURL);
    const templateURL = new URL(blockURL);
    templateURL.search = url.search;
    return templateURL.toString();
}


function processTab(tabId, url) {
    if (url.indexOf(blockURL) == 0) return;
    conn.check(tabId, url);
}

vendor.webNavigation.onBeforeNavigate.addListener(handleBeforeNavigate);

conn.block = function (data) {
    if (!data.url) return;
    if (!data.redirectURL) return;
    if (!data.tabId) return;
    console.log(`blocking ${data.url}`);

    const redirectURL = convertRedirectURLToLocalTemplate(data.redirectURL);

    vendor.tabs.update(data.tabId, { url: redirectURL });
};

conn.onfocus = function () {
    processFrontmostTab();
}

conn.connect();
