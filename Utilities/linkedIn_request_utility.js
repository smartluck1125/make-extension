const getAccountProfile = () => {
    return makeLinkedinRequest('/voyager/api/me', {}, {})
        .then(selfProfileData => {
            let urnWithId = selfProfileData["miniProfile"]["objectUrn"];
            let liUserIDParts = urnWithId.toString().split(":");
            let memberId = liUserIDParts[liUserIDParts.length - 1];
            let profileImage = resolvePropertyFromObject(selfProfileData, "miniProfile", "picture", "com.linkedin.common.VectorImage", "rootUrl");
            let imageOptions = resolvePropertyFromObject(selfProfileData, "miniProfile", "picture", "com.linkedin.common.VectorImage", "artifacts");
            let nextPart = imageOptions?.at(-1)["fileIdentifyingUrlPathSegment"];
            profileImage += nextPart;
            if (!nextPart)
                profileImage = undefined;

            return {
                memberId: memberId,
                firstName: selfProfileData["miniProfile"]["firstName"],
                lastName: selfProfileData["miniProfile"]["lastName"],
                headline: selfProfileData["miniProfile"]["occupation"],
                profileImage: profileImage,
            };
        });
}

const getMappedLinkedInCookies = async () => {
    const browserCookies = await chrome.cookies.getAll({ domain: LINKEDIN_DOMAIN });
    return browserCookies.map(cookie => {
        return {
            key: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            expires: cookie.expirationDate
        };
    });
}

const getAccountProfileWithCookies = async () => {
    const profile = await getAccountProfile();
    profile['cookies'] = await getMappedLinkedInCookies();
    return profile;
}
