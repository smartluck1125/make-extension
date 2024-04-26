/** Browser Utilities **/
async function extractCookie(cookieName) {
    const cookies = await chrome.cookies.getAll({
        name: cookieName,
    });
    return cookies.find(x => x.name === cookieName);
}

const getCookiesFromPage = async (pageUrl) => {
    const cookies = await chrome.cookies.getAll({url: pageUrl});
    return JSON.stringify(cookies);
}

const getUrl = chrome.tabs.query({active: true, currentWindow: true})
    .then(([{url}]) => url);

/** Browser navigation checks **/
async function isOnHeyReach() {
    const currentURL = await getUrl;
    if (currentURL.includes("heyreach.io")) {
        return true
    }
    return currentURL.includes("kanterstrajk.xyz");
}

async function isOnLinkedin() {
    const currentURL = await getUrl;
    return currentURL.includes("https://www.linkedin.com");
}

/** Browser navigation handlers **/
function loadHeyReachInNewTab() {
    chrome.tabs.create({url: `${HEYREACH_CLIENT_ENDPOINT}/account/login`});
}

function loadLinkedInInNewTab() {
    chrome.tabs.create({url: 'https://www.linkedin.com/'});
}

function loadHeyReachAccountsInNewTab() {
    chrome.tabs.create({url: `${HEYREACH_CLIENT_ENDPOINT}/app/linkedin-accounts`});
}

async function logoutLinkedIn() {
    const cookies = await chrome.cookies.getAll({ url: "https://www.linkedin.com" });
    for (let cookie of cookies) {
        await chrome.cookies.remove({ url: "https://www.linkedin.com", name: cookie.name });
    }

    await chrome.tabs.update({ url: "https://www.linkedin.com" });
    void initiateView();
}