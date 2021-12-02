import { HttpClient } from "bungie-api-ts/http";
export declare function createOauthHttpClient(apiKey: string, client_id: string, client_secret: string, 
/**
 * a function to store arbitrary JSON-encodable data.
 * this should return an authentication token object.
 */
retrieveToken: () => undefined | BungieNetTokenMeta | Promise<undefined | BungieNetTokenMeta>, 
/**
 * a function to retrieve arbitrary JSON-encodable data.
 * the authentication token object will be sent as a param to this function.
 */
storeToken: (_: BungieNetTokenMeta) => any | Promise<any>, options?: {
    /**
     * always ON, unless explicitly set to false. this backs off increasingly,
     * delaying new api requests as previous ones encounter downtime or throttling responses.
     *
     * this will not automatically retry, the error is still passed upstack.
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
