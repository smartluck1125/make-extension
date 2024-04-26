/** Function Utilities **/
const b64DecodeUnicode = str =>
    decodeURIComponent(
        Array.prototype.map.call(atob(str), c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));

const parseJwt = token =>
    JSON.parse(
        b64DecodeUnicode(
            token.split('.')[1].replace('-', '+').replace('_', '/')
        )
    );

function resolvePropertyFromObject(start) {
    return [].slice.call(arguments, 1).reduce(function (obj, prop) {
        return obj && obj[prop];
    }, start);
}

const getCookieHeaderFromCookies = (cookies) => cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(';');

const validateCustomProxyInput = (customProxyInput) => {
    if (customProxyInput.host == null || customProxyInput.host === "")
        throw {errorMessage: "Proxy Host is not valid"};
    if (customProxyInput.port == null || customProxyInput.port === "")
        throw {errorMessage: "Proxy Port is not valid"};
}

const getCustomProxyConfig = () => {
    const host = document.getElementById("proxyHost").value;
    const port = document.getElementById("proxyPort").value;
    const user = document.getElementById("proxyUser").value;
    const pass = document.getElementById("proxyPass").value;
    return {
        pass,
        host,
        user,
        port,
    }
}

const isCustomProxyRequired = async () => {
    if (!sessionStorage.getItem("customProxyRequired")) {
        await checkIfSubscriptionRequiresCustomProxy();
    }

    return sessionStorage.getItem("customProxyRequired") === 'true';
}
