/** Popup view changing logic **/
const changeView = (viewName, metadata = undefined) => {
    let viewIds = [
        "guestView",
        // "confirmLoginView",
        "loggedInDefaultView",
        "logInLinkedInAccountView",
        "loggedInLinkedInAccountView",
        "loadingView",
    ];
    if (!viewIds.includes(viewName)) {
        // Todo: handle error
        return;
    }

    for (let id of viewIds) {
        document.getElementById(id).style.display = id !== viewName ? 'none' : 'flex';
    }

    document.dispatchEvent(new CustomEvent("changedView", {detail: {metadata: metadata, viewId: viewName}}));
}

/** Listeners **/
document.addEventListener("changedView", async (e) => {
    switch (e.detail.viewId) {
        case "loggedInDefaultView": {
            let sessionData = await getTenantIdentity();
            document.getElementById("loggedInEmail").innerText = sessionData?.['email'] ?? "";
            const onLinkedIn = await isOnLinkedin();
            document.getElementById("goToLinkedInButton").style.display = onLinkedIn ? 'none' : 'inline-block';
            break;
        }
        case "loggedInLinkedInAccountView": {
            let profile = await getAccountProfile();
            document.getElementById("linkedInAccName2").innerText = [(profile?.firstName ?? ""), (profile?.lastName ?? "")].join(" ");
            if (profile.profileImage)
                document.getElementById("liLoginProfileImage2").src = profile.profileImage;
            break;
        }
        case "logInLinkedInAccountView": {
            let profile = await getAccountProfile();
            document.getElementById("linkedInAccName").innerText = [(profile?.firstName ?? ""), (profile?.lastName ?? "")].join(" ");
            document.getElementById("liAccFirstName").innerText = profile?.firstName ?? "";
            if (profile.profileImage)
                document.getElementById("liLoginProfileImage").src = profile.profileImage;
            const customProxyRequired = await isCustomProxyRequired();
            if (customProxyRequired) {
                document.getElementById("customProxyButton").style.display = 'none';
                document.getElementById("customProxyInput").style.display = 'flex';
                document.getElementById("cancelCustomProxy").style.display = 'none';
            }
            break;
        }
        case "guestView": {
            if (e.detail.metadata.logInButton === false)
                document.getElementById("logIntoHeyReachButton").style.display = 'none';
            break;
        }
    }
});

const initiateView = async () => {
    changeView('loadingView');
    const onHeyReach = await isOnHeyReach();
    const onLinkedIn = await isOnLinkedin();
    const heyReachTenantAuthenticated = await isTenantAuthenticated();
    if (heyReachTenantAuthenticated) {
        const liAtCookie = await extractCookie("li_at");
        if (liAtCookie) {
            let accountConnectedToHeyReach;
            try {
                accountConnectedToHeyReach = await checkIfAccountIsConnected();
            } catch (e) {
                changeView("guestView", {logInButton: true});
            }
            if (accountConnectedToHeyReach) {
                document.getElementById("successLoginMessage").classList.remove("info-message");
                document.getElementById("successLoginMessage").classList.add("info-message-hide");
                changeView("loggedInLinkedInAccountView");
            } else {
                document.getElementById("loginErrorMessage").style.display = 'none';
                document.getElementById("liLoginLoading").style.display = 'none';
                document.getElementById("liLoginNotLoading").style.display = 'flex';
                changeView('logInLinkedInAccountView');
            }
        } else {
            changeView("loggedInDefaultView");
        }
    } else {
        changeView("guestView", {logInButton: !onHeyReach});
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // Initiate screen based on state
    void initiateView();

    // Setup button listeners
    // Login button on the initial screen
    document.getElementById("logIntoHeyReachButton").addEventListener('click', async () => {
        const onHeyReach = await isOnHeyReach();
        if (!onHeyReach)
            loadHeyReachInNewTab();
    });

    // Buttons on the logged in default screen
    document.getElementById('seeConnectedAccountsButton').addEventListener('click', () => {
        loadHeyReachAccountsInNewTab();
    });
    document.getElementById('disconnectAccountButton').addEventListener('click', () => {
        loadHeyReachAccountsInNewTab();
    });
    document.getElementById('loginLiAccButton').addEventListener('click', () => {
        loadLinkedInInNewTab();
    });
    document.getElementById('linkedInLoginConfirmButton').addEventListener('click', async () => {
        document.getElementById("liLoginLoading").style.display = 'flex';
        document.getElementById("liLoginNotLoading").style.display = 'none';
        document.getElementById("loginErrorMessage").style.display = 'none';
        logInLinkedInAccount()
            .then(() => {
                changeView("loggedInLinkedInAccountView");
                document.getElementById("successLoginMessage").classList.remove("info-message-hide");
                document.getElementById("successLoginMessage").classList.add("info-message");
                setTimeout(() => {
                    document.getElementById("successLoginMessage").classList.remove("info-message");
                    document.getElementById("successLoginMessage").classList.add("info-message-hide");
                }, 2500);
            })
            .catch(err => {
                document.getElementById("loginErrorMessage").style.display = 'block';
                document.getElementById("loginErrorMessage").innerText = err.errorMessage;
            })
            .finally(() => {
                document.getElementById("liLoginLoading").style.display = 'none';
                document.getElementById("liLoginNotLoading").style.display = 'flex';
            });
    });
    document.getElementById('customProxyButton').addEventListener('click', () => {
        document.getElementById("customProxyInput").style.display = "flex";
        document.getElementById("customProxyButton").style.display = "none";
        document.getElementById("cancelCustomProxy").style.display = "flex";
    });
    document.getElementById("cancelCustomProxy").addEventListener('click', () => {
        document.getElementById("customProxyInput").style.display = "none";
        document.getElementById("customProxyButton").style.display = "flex";
        document.getElementById("cancelCustomProxy").style.display = "none";
    });

    document.getElementById('loginOtherAccountButton').addEventListener('click', async () => {
        await logoutLinkedIn();
    });

    document.getElementById('changeAccButton').addEventListener('click', async () => {
        await logoutLinkedIn();
    });

    document.getElementById('goToLinkedInButton').addEventListener('click', async () => {
        await loadLinkedInInNewTab();
    });
});
