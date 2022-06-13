import { HttpClient } from "bungie-api-ts/http";
export interface BungieNetToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    refresh_expires_in: number;
    membership_id: string;
}
export interface BungieNetTokenMeta {
    token: BungieNetToken;
    expires_at: number;
    refresh_expires_at: number;
}
/** creates a bungie-api-ts-compatible httpclient, with oauth integration */
export declare function createOauthHttpClient(apiKey: string, client_id: string, client_secret: string, 
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
retrieveToken: () => undefined | BungieNetTokenMeta | Promise<undefined | BungieNetTokenMeta>, 
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
storeToken: (data: BungieNetTokenMeta) => any | Promise<any>, options?: {
    /**
     * always ON, unless explicitly set to false.
     * as API requests encounter downtime or throttling responses,
     * this backs off increasingly delaying new api requests
     *
     * this will not automatically retry, the error is still passed up-stack.
     * this simply decreases chances of encountering repeated errors.
     */
    responsiveThrottling?: boolean;
    /**
     * if set, this client will abort the request after some time,
     * then run the onTimeout function to notify upstack of what happened
     */
    withAbortTimeout?: {
        timeout: number;
        onTimeout?: (startTime: number, timeout: number) => void;
    };
    /**
     * if set, this client will run the onTimeout function if the request is taking a long time,
     * e.g. generate a "still waiting!" notification
     */
    withWarningTimeout?: {
        timeout: number;
        onTimeout: (startTime: number, timeout: number) => void;
    };
    verbose?: boolean;
}): HttpClient;
export declare function looksLikeBnetAuthToken(token: BungieNetToken): boolean;
/** exchanges an authorization code from bungie, for an oauth token */
export declare function getInitialToken(
/** the thing that is returned in the URL query params, by bungie.net */
authorization_code: string, client_id: string, client_secret: string, 
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
storeToken: (_: BungieNetTokenMeta) => any | Promise<any>): Promise<BungieNetToken>;
export declare const setupTokenWithAuthCode: typeof getInitialToken;
