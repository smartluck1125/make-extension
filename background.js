chrome.webNavigation.onBeforeNavigate.addListener(async (details) =>{
    if (details.url.includes("https://www.linkedin.com/uas/logout")){
        const cookies = await chrome.cookies.getAll({ url: "https://www.linkedin.com" });
        for (let cookie of cookies){
            await chrome.cookies.remove({ url: "https://www.linkedin.com", name: cookie.name });
        }

        await chrome.tabs.update(details.tabId, { url: "https://www.linkedin.com" });
        void initiateView();
    }
});

importScripts(
    "env.js",
    "Utilities/browser_utility.js",
    "Utilities/linkedIn_request_utility.js",
    "Utilities/request_utility.js",
    "Utilities/utility.js",
)

chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
        if (message == 'version') {
            const manifest = chrome.runtime.getManifest();
            sendResponse({
                type: 'success',
                version: manifest.version
            });
        }
        else if (message == "getLinkedInProfile"){
            getAccountProfileWithCookies().then((res) => {
                sendResponse({
                    result: res,
                    success: true,
                });
            })
            .catch((err) => {
                sendResponse({
                    result: undefined,
                    success: false,
                    errorMessage: err?.errorMessage,
                    errorStatus: err?.response?.status
                });
            });
        }
        else if (message == "changeLiAccount"){
            logoutLinkedIn();
        }

        return true;
    }
);

chrome.runtime.onInstalled.addListener(function (object) {
    // Take me to the accounts page of HeyReach after installing the extension
    let externalUrl = HEYREACH_CLIENT_ENDPOINT + HEYREACH_ACCOUNTS_ENDPOINT;
    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({ url: externalUrl }, function (tab) {});
    }
});
