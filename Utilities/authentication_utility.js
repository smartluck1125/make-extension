/** HeyReach Tenant Authentication **/
function getTenantIdentity() {
    return getTenantIdentityFromCookies();
}

async function getTenantIdentityFromCookies() {
    let authTokenCookie = await extractCookie('Abp.AuthToken');
    if (!authTokenCookie?.value)
        return null;
    let authTokenParsed = JSON.parse(JSON.stringify(parseJwt(authTokenCookie.value)));
    let emailFromAuthToken = authTokenParsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    return {
        token: authTokenCookie.value,
        email: emailFromAuthToken,
    };
}

const isTenantAuthenticated = () => {
    return getTenantIdentityFromCookies()
        .then(resp => {
            return !!resp;
        })
        .catch((e) => {
            return false;
        });
}
