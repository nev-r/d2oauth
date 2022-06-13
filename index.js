import { createHttpClient } from "httpclient";
const TOKEN_URL = "https://www.bungie.net/platform/app/oauth/token/";
/** creates a bungie-api-ts-compatible httpclient, with oauth integration */
export function createOauthHttpClient(apiKey, client_id, client_secret, 
/**
 * provide a function which retrieves arbitrary JSON-encodable data.
 * this should return an authentication token object.
 *
 * @example
 * () => JSON.parse(localStorage.getItem('oauth_token'));
 *
 * @example
 * () => JSON.parse(fs.readFileSync('./oauth_token.json', {encoding:'utf8'}));
 */
retrieveToken, 
/**
 * provide a function which stores arbitrary JSON-encodable data.
 * the authentication token object will be sent as a param to this function.
 *
 * @example
 * (data) => localStorage.setItem('oauth_token', JSON.stringify(data));
 *
 * @example
 * (data) => fs.writeFileSync('./oauth_token.json', JSON.stringify(data));
 */
storeToken, options = {}) {
    async function fetchWithBungieOAuth(request, requestOptions) {
        const tokenMeta = await retrieveToken();
        if (!tokenMeta)
            throw `failed to retrieve auth token from storage!
is there a problem with the retrieveToken function?
or has no initial token been issued yet?`;
        const { expires_at, refresh_expires_at, token } = tokenMeta;
        let { refresh_token, access_token } = token;
        const now = Date.now();
        // haven't reached expiry yet
        if (now < expires_at) {
            // we're good as-is
            options.verbose && console.info("still active ☑️ ");
        }
        // token expired but refresh available
        else if (now < refresh_expires_at) {
            const body = new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token,
                client_id,
                client_secret,
            });
            let fetchedNewToken;
            try {
                fetchedNewToken = await fetch(TOKEN_URL, {
                    method: "POST",
                    body,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });
            }
            catch (e) {
                console.log(e);
                throw "fetch failed ❌";
            }
            let parsedNewToken;
            try {
                parsedNewToken = await fetchedNewToken.json();
            }
            catch (e) {
                console.log(e);
                throw "parse failed ❌";
            }
            if (!looksLikeBnetAuthToken(parsedNewToken)) {
                console.error(parsedNewToken);
                throw `this doesn't look like a token`;
            }
            options.verbose && console.info("refreshed ☑️ ");
            // token refreshed, yay
            const tokenMeta = {
                token: parsedNewToken,
                expires_at: Date.now() + token.expires_in * 1000,
                refresh_expires_at: Date.now() + token.refresh_expires_in * 1000,
            };
            await storeToken(tokenMeta);
            access_token = parsedNewToken.access_token;
        }
        else {
            throw "auth expired ❌";
        }
        if (typeof request === "string")
            request = new Request(request);
        request.headers.set("Authorization", `Bearer ${access_token}`);
        return await fetch(request, requestOptions);
    }
    return createHttpClient(apiKey, {
        ...options,
        fetchFunctionOverride: fetchWithBungieOAuth,
    });
}
export function looksLikeBnetAuthToken(token) {
    return (token &&
        typeof token.access_token === "string" &&
        typeof token.token_type === "string" &&
        typeof token.expires_in === "number" &&
        typeof token.refresh_token === "string" &&
        typeof token.refresh_expires_in === "number" &&
        typeof token.membership_id === "string");
}
/** exchanges an authorization code from bungie, for an oauth token */
export async function getInitialToken(
/** the thing that is returned in the URL query params, by bungie.net */
authorization_code, client_id, client_secret, 
/**
 * provide a function which stores arbitrary JSON-encodable data.
 * the authentication token object will be sent as a param to this function.
 *
 * @example
 * (data) => localStorage.setItem('oauth_token', JSON.stringify(data));
 *
 * @example
 * (data) => fs.writeFileSync('./oauth_token.json', JSON.stringify(data));
 */
storeToken) {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: authorization_code,
        client_id,
        client_secret,
    });
    const tokenFetch = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
    });
    const token = await tokenFetch.json();
    if (!looksLikeBnetAuthToken(token)) {
        console.error(token);
        throw `this doesn't look like a token`;
    }
    const tokenMeta = {
        token,
        expires_at: Date.now() + token.expires_in * 1000,
        refresh_expires_at: Date.now() + token.refresh_expires_in * 1000,
    };
    await storeToken(tokenMeta);
    return token;
}
export const setupTokenWithAuthCode = getInitialToken;
