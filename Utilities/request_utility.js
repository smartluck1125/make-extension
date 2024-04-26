function makeRequest(requestUrl, requestHeaders, requestPayload = undefined, method = "GET") {
    if (method === "GET")
        requestPayload = undefined;

    return fetch(
        requestUrl,
        {
            method: method,  // Use the appropriate HTTP method here
            headers: requestHeaders,
            body: JSON.stringify(requestPayload),
            credentials: 'include',
        })
        .then(async response => {
            await handleFailedResponse(response);
            return response;
        });
}

async function makeHeyReachRequest(endpoint, headers = {}, payload, method) {
    const url = HEYREACH_API_ENDPOINT + endpoint;
    const tenantIdentity = await getTenantIdentity();
    const tenantAuthenticationToken = JSON.stringify(tenantIdentity.token).replaceAll('"', '');
    headers['content-type'] = 'application/json';
    headers['authorization'] = `Bearer ${tenantAuthenticationToken}`;
    return makeRequest(url, headers, payload, method)
        .then(async response => await response.json());
}

async function makeLinkedinRequest(endpoint, headers = {}, payload, method) {
    const url = LINKEDIN_URL + endpoint;
    const cookiesJson = await getCookiesFromPage(LINKEDIN_URL);
    const cookies = JSON.parse(cookiesJson);
    const cookieHeader = getCookieHeaderFromCookies(cookies);

    const jSessionCookie = cookies.find(cookie => cookie.name === 'JSESSIONID');
    const csrfToken = jSessionCookie ? (typeof jSessionCookie === 'string' ? jSessionCookie : jSessionCookie.value.replaceAll('"', '')) : '';

    headers['x-restli-protocol-version'] = '2.0.0';
    headers['csrf-token'] = csrfToken;
    headers['Cookie'] = cookieHeader;

    return makeRequest(url, headers, payload, method)
        .then(async response => await response.json());
}

async function handleFailedResponse(response) {
    if (!response.ok) {
        const resp = await response.json();
        throw {
            response: response,
            errorMessage: resp?.error?.message ?? "Unknown error occured",
        };
    }
}
