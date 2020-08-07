module.exports.getSessionCookie = function getSessionCookie(admin, req, onSuccess, onError) {
    const sessionCookie = req.cookies.session || '';

    // Verify the session cookie. In this case an additional check is added to detect
    // if the user's Firebase session was revoked, user deleted/disabled, etc.
    admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((decodedClaims) => {
        console.log(`decodedClaims: ${decodedClaims}`);
        onSuccess();
    }).catch((error) => {
        // Session cookie is unavailable or invalid. Force user to login.
        console.log('ERROR');
        console.log(error);
        onError();
    });
};