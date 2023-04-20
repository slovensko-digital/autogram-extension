import fetch from 'cross-fetch';

import { getRandomBytes, toHex, toUint32 } from './crypto/random';

/**
 * Octosign White Label API client for the app running in the server mode.
 *
 * ### Example (es module and async/await)
 * ```js
 * import { apiClient } from '@octosign/client';
 * const client = apiClient();
 *
 * // Launch URL that should be used by user to launch the signer application
 * console.log(client.getLaunchURL());
 *
 * await client.waitForStatus('READY');
 *
 * const content = '<?xml version="1.0"?><Document><Title>Lorem Ipsum</Title></Document>';
 * console.log(await client.sign({ content }));
 * // => { content: '<?xml version="1.0"?><Document><Title>Lorem Ipsum</Title>...</Document>' }
 * ```
 *
 * All further examples use es module and async/await, but the library can be also used as commonjs module and using promises.
 *
 * ### Example (commonjs and promises)
 * ```js
 * var apiClient = require('@octosign/client').apiClient;
 * var client = apiClient();
 *
 * console.log(client.getLaunchURL());
 *
 * client.waitForStatus('READY')
 *   .then(function() {
 *     var content = '<?xml version="1.0"?><Document><Title>Lorem Ipsum</Title></Document>';
 *     return client.sign({ content: content });
 *   })
 *   .then(function(signedDocument) {
 *     console.log(signedDocument);
 *     // => { content: '<?xml version="1.0"?><Document><Title>Lorem Ipsum</Title>...signature...</Document>' }
 *   });
 * ```
 *
 * @returns An instance of API client.
 */
export function apiClient(options?: ApiClientConfiguration) {
    const configurationDefaults = {
        serverProtocol: 'http',
        serverHost: '127.0.0.1',
        serverPort: 37200,
        customProtocol: 'signer',
        disableSecurity: false,
        requestsOrigin: typeof location !== 'undefined' ? location.origin : '*',
        secretKey: toHex(getRandomBytes(32)),
        secretInitialNonce: toUint32(getRandomBytes(4)),
    } as const;
    const configuration = { ...configurationDefaults, ...options };

    // TODO: We should keep it as 32-bit int that can overflow back to minimum value
    // TODO: There is one nonce for each sensitive point like sign
    // const nonce = configurationDefaults.secretInitialNonce;

    const serverUrl = new URL(
        `${configuration.serverProtocol}://${configuration.serverHost}:${configuration.serverPort}`
    );

    return {
        /**
         * Construct custom protocol launch URI that can be opened by user to launch the application.
         *
         * ### Example
         * ```js
         * import { apiClient } from '@octosign/client';
         * const client = apiClient();
         * console.log(client.createLaunchURI());
         * // => signer://listen/37200/https%3A%2F%2Fexample.com/3a2bca8d73c62e75177fa877de283cc0c96cdf3ba08f8eb878a96da93de3d798/260372071
         * ```
         *
         * @returns URL that can be opened by the user.
         */
        getLaunchURL(command: 'listen' = 'listen') {
            const origin = encodeURIComponent(configuration.requestsOrigin);
            const key = encodeURIComponent(configuration.secretKey);
            const nonce = encodeURIComponent(configuration.secretInitialNonce.toString());
            const security = configuration.disableSecurity ? '*' : `${origin}/${key}/${nonce}`;

            return `${configuration.customProtocol}://${command}/${configuration.serverPort}/${security}`;
        },

        /**
         * Retrieve server info with its current state.
         *
         * ### Example
         * ```js
         * import { apiClient } from '@octosign/client';
         * const client = apiClient();
         * console.log(await client.info());
         * // => { version: '1.2.3', status: 'READY' }
         * ```
         *
         * @returns Info about the server and its current state.
         */
        info(): Promise<ServerInfo> {
            const url = new URL('info', serverUrl);
            const init = { cache: 'no-store' } as const;
            return fetch(url.toString(), init).then((response) => response.json());
        },

        /**
         * Wait for server to be in the requested state.
         *
         * Repeatedly tries to get server info retrying
         *
         * ### Example
         * ```js
         * import { apiClient } from '@octosign/client';
         * const client = apiClient();
         * await client.waitForStatus('READY');
         * // => { version: '1.2.3', status: 'READY' }
         * ```
         *
         * @param status - Wanted status of the server.
         * @param timeout - Timeout in seconds before giving up and rejecting with error.
         * @param delay - Delay before making next attempt after failure.
         * @returns Info about the server and its current state.
         */
        waitForStatus(status: ServerInfo['status'], timeout = 60, delay = 4): Promise<ServerInfo> {
            const url = new URL('info', serverUrl);
            const init = { cache: 'no-store' } as const;

            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                let controller: AbortController;
                let lastResponse: ServerInfo;
                let lastError: Error = new Error('No request ever finished');
                let finished = false;

                const overallTimeout = setTimeout(() => {
                    if (!controller.signal.aborted) controller.abort();
                    finished = true;
                    reject(lastError);
                }, timeout * 1000);

                // _eslint-disable-next-line functional/no-loop-statement
                while (!finished) {
                    controller = new AbortController();
                    const requestTimeout = setTimeout(() => {
                        if (!controller.signal.aborted) controller.abort();
                    }, (delay + 1) * 1000);

                    try {
                        lastResponse = await (await fetch(url.toString(), init)).json();
                        if (lastResponse.status === status) {
                            finished = true;
                            clearTimeout(overallTimeout);
                            clearTimeout(requestTimeout);
                            resolve(lastResponse);
                            break;
                        }
                    } catch (error) {
                        clearTimeout(requestTimeout);

                        if (error.name !== 'AbortError') {
                            lastError = error;
                        }
                    }

                    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
                }
            });
        },

        /**
         * Sign a document.
         *
         * ### Example
         * ```js
         * import { apiClient } from '@octosign/client';
         * const client = apiClient();
         *
         * console.log(await client.sign({ content: '<?xml version="1.0"?><Document><Title>Lorem Ipsum</Title></Document>' }));
         * // => { content: '...signed document...' }
         * ```
         *
         * @param signatureParameters - Optional signature parameters.
         * @param payloadMimeType - Optional payload mime type, defaults to `'application/xml'` - plaintext XML. Must reflect document content type so should be changed if content is not a plaintext XML.
         * @returns Signed document.
         */
        sign(
            document: Document,
            signatureParameters: SignatureParameters = { format: 'XADES' },
            payloadMimeType = 'application/xml'
        ): Promise<Document> {
            const url = new URL('sign', serverUrl);

            const body = {
                document,
                parameters: signatureParameters,
                payloadMimeType,
            };

            const init: RequestInit = {
                method: 'POST',
                // Server considers text/plain as JSON to prevent CORS preflight
                headers: { 'Content-Type': 'text/plain' },
                cache: 'no-store',
                body: JSON.stringify(body),
            } as const;

            return fetch(url.toString(), init).then((response) => response.json());
        },
    };
}

/**
 * Client configuration options.
 */
export type ApiClientConfiguration = {
    /**
     * Protocol of the server - Octosign White Label
     *
     * Defaults to `'http'`
     */
    readonly serverProtocol?: 'http' | 'https';

    /**
     * Host of the server - Octosign White Label
     *
     * Defaults to `'127.0.0.1'`
     */
    readonly serverHost?: string;

    /**
     * Port of the server - Octosign White Label
     *
     * Influences also the URL generated to launch the application.
     *
     * Defaults to `37200`
     */
    readonly serverPort?: number;

    /**
     * Custom protocol used with the application, e.g., to launch it - `signer://listen`.
     *
     * Defaults to `'signer'`.
     */
    readonly customProtocol?: string;

    /**
     * Disables using of HMAC in messages and sets `requestsOrigin` to *
     *
     * Make sure you understand the implications on the security!
     *
     * Defaults to `false`.
     */
    readonly disableSecurity?: boolean;

    /**
     * Origin the server will be asked to trust
     *
     * Influences generated launch URL that sets trusted origin
     *
     * Defaults to the current location origin, e.g. `'https://example.com'` if available, `'*'` otherwise.
     */
    readonly requestsOrigin?: string;

    /**
     * Secret key used for the communication.
     *
     * Should be cryptographically secure random hex string generated separately for each session.
     * You can generate this key on the server side and set it on the session so its reused across navigation.
     * There is no need to configure this unless you know what you are doing.
     *
     * Defaults to random 64-char (256-bit) hex string generated on instantiation.
     */
    readonly secretKey?: string;

    /**
     * Secret initial nonce used for the communication.
     *
     * Should be cryptographically secure random 32-bit integer generated separately for each session.
     * You can generate this number on the server side and set it on the session so its reused across navigation.
     * There is no need to configure this unless you know what you are doing.
     *
     * Defaults to random integer generated on instantiation.
     */
    readonly secretInitialNonce?: number;
};

/**
 * Info about the server and its current state.
 */
export type ServerInfo = {
    /**
     * Version of the Octosign White Label.
     *
     * Should follow semantic versioning.
     */
    readonly version: string;

    /**
     * Current server status.
     */
    readonly status: 'LOADING' | 'READY';
};

/**
 * Document exchanged during the signing.
 */
export type Document = {
    /**
     * Optional ID you can use to identify your document.
     */
    readonly id?: string;

    /**
     * Optional title shown during signing.
     */
    readonly title?: string;

    /**
     * Optional legal effect shown to user next to the signing button.
     */
    readonly legalEffect?: string;

    /**
     * Document content for signing.
     *
     * Can be plaintext in the case of XML base64-encoded binary in the case of any format.
     */
    readonly content: string;
};

/**
 * Parameters used to create a signature.
 */
export type SignatureParameters = {
    /**
     * Signature format PAdES is usable only with documents of type application/pdf.
     * Format XAdES is usable with XML or with any file type if using an ASiC container.
     */
    readonly format: 'PADES' | 'XADES';

    // TODO: Add support for other
};
