async function logInLinkedInAccount() {
    let cookies = await getMappedLinkedInCookies();
    let inboxConfig = document.getElementById("inboxConfig")?.value ?? '0';
    const usingCustomProxy = document.getElementById("customProxyInput").style.display !== 'none';
    const accountProfile = await getAccountProfile();
    let payload = {
        memberId: accountProfile.memberId,
        cookies: cookies,
        inboxScrapeConfiguration: parseInt(inboxConfig)
    };
    if (usingCustomProxy) {
        const proxyConfig = getCustomProxyConfig();
        validateCustomProxyInput(proxyConfig);
        await testCustomProxy(proxyConfig);
        payload.customProxy = proxyConfig;
    }

    /* Registering the account to the tenant in HeyReach */
    const endpoint = '/LinkedInAccount/CreateLinkedInAccountFromCookies';
    return makeHeyReachRequest(endpoint, {}, payload, "POST")
        .catch(err => {
            // todo: handle errors
            // the error that is thrown here will be printed to the user
            throw err;
        });
}

/**
 * Checks if the logged in LinkedIn accounts is connected to the logged in HeyReach account
 * @returns {Promise<* | boolean>}
 */
const checkIfAccountIsConnected = async () => {
    const linkedInAccountProfile = await getAccountProfile();
    const memberId = linkedInAccountProfile.memberId;
    const endpoint = '/LinkedInAccount/GetValidLinkedInAccountsForTenant';
    return makeHeyReachRequest(endpoint, {}, undefined, "GET")
        .then(response => response["result"].some(x => x.linkedInUserProfile?.id === memberId))
        .catch(() => false);
}

const testCustomProxy = (proxyConfig) => {
    const endpoint = '/LinkedInAccount/TestProxy';
    return makeHeyReachRequest(endpoint, {}, proxyConfig, "POST")
        .catch(() => {
            throw {errorMessage: "Custom proxy is not valid"}
        });
}

const checkIfSubscriptionRequiresCustomProxy = async () => {
    const endpoint = '/LinkedInAccount/CheckIfCustomProxyIsRequired';
    await makeHeyReachRequest(endpoint, {}, {}, "GET")
        .then(customProxyRequired => {
            sessionStorage.setItem("customProxyRequired", customProxyRequired.result);
        });
}
