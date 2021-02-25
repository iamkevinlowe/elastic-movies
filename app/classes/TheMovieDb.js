const https = require('https');
const querystring = require('querystring');
const ApiResponse = require('./ApiResponse');
const Elasticsearch = require('./Elasticsearch');

const API_HOST = 'api.themoviedb.org';
const API_TOKEN = process.env.TMDB_API_TOKEN;
const API_PAGE_LIMIT = 1000;

const MAX_RETRIES = 5;

const ERROR_CODE_CONNECTION_RESET = 'ECONNRESET';
const ERROR_CODE_NOT_FOUND = 'ENOTFOUND';
const ERROR_CODE_TIMEDOUT = 'ETIMEDOUT';
const ERROR_CODES_RETRYABLE = [
	ERROR_CODE_CONNECTION_RESET,
	ERROR_CODE_NOT_FOUND,
	ERROR_CODE_TIMEDOUT
];

const esClient = new Elasticsearch({ node: process.env.ES_HOST });

class TheMovieDb {
	/**
	 * Creates an instance of TheMovieDB
	 */
	constructor() {
	}

	/**
	 * Makes an api request to The Movie DB
	 * [API Docs]{@link https://developers.themoviedb.org/3/getting-started/introduction}
	 *
	 * @async
	 * @param {string} endpoint
	 * @param {Object} [params={}]
	 * @param {boolean} [canRetry=true]
	 * @returns {Promise<ApiResponse>}
	 */
	async request(endpoint, params = {}, canRetry = true) {
		const options = this._getRequestOptions(endpoint, params);

		return new Promise((resolve, reject) => {
			const req = https.request(options, res => {
				const chunks = [];

				res.on('data', chunk => chunks.push(chunk));

				res.on('end', async () => {
					if (
						res.statusCode !== 200
						|| !/application\/json/.test(res.headers['content-type'])
					) {
						await this._handleError({
							message: 'Failed on response end',
							requestParams: this._getRequestOptions(endpoint, params, true),
							responseCode: res.statusCode,
							responseMessage: res.statusMessage,
							responseBody: chunks.join('')
						});
						reject(new Error(res.statusMessage));
						return;
					}

					try {
						const response = JSON.parse(chunks.join(''));
						const apiResponse = new ApiResponse();

						if (
							typeof response.page !== 'undefined'
							&& typeof response.total_pages !== 'undefined'
							&& typeof response.results !== 'undefined'
						) {
							apiResponse.setResponse(response.results);

							if (
								response.page < response.total_pages
								&& response.page < API_PAGE_LIMIT
							) {
								params.page++;
								apiResponse.setNextRequestCallback(this.request.bind(this, endpoint, params));
							}
						} else {
							apiResponse.setResponse(response);
						}

						resolve(apiResponse);
					} catch (error) {
						await this._handleError({
							message: 'Failed on response end',
							requestParams: this._getRequestOptions(endpoint, params, true),
							responseCode: res.statusCode,
							responseMessage: res.statusMessage,
							responseBody: chunks.join(''),
							errorCode: error.code,
							errorMessage: error.message
						});

						if (
							canRetry
							&& ERROR_CODES_RETRYABLE.includes(error.code)
						) {
							await this._retryRequest(resolve, reject, endpoint, params);
						} else {
							reject(error);
						}
					}
				});

				res.on('error', async error => {
					await this._handleError({
						message: 'Failed on response error',
						requestParams: this._getRequestOptions(endpoint, params, true),
						responseCode: res.statusCode,
						responseMessage: res.statusMessage,
						responseBody: chunks.join(''),
						errorCode: error.code,
						errorMessage: error.message
					});

					if (
						canRetry
						&& ERROR_CODES_RETRYABLE.includes(error.code)
					) {
						await this._retryRequest(resolve, reject, endpoint, params);
					} else {
						reject(error);
					}
				});
			});

			req.on('error', async error => {
				await this._handleError({
					message: 'Failed on request error',
					requestParams: this._getRequestOptions(endpoint, params, true),
					errorCode: error.code,
					errorMessage: error.message
				});

				if (
					canRetry
					&& ERROR_CODES_RETRYABLE.includes(error.code)
				) {
					await this._retryRequest(resolve, reject, endpoint, params);
				} else {
					reject(error);
				}
			});

			req.end()
		}).catch(error => {
			console.log('ERROR!! TheMovieDB messed up', error);
		});
	}

	/**
	 * Returns request options
	 *
	 * @param {string} endpoint
	 * @param {object} params
	 * @param {boolean} [maskToken=false]
	 * @returns {{path: string, headers: {Authorization: string, Connection: string, "Content-Type": string}, hostname: string, method: string, port: number}}
	 * @private
	 */
	_getRequestOptions(endpoint, params, maskToken = false) {
		return {
			hostname: API_HOST,
			port: 443,
			path: `/3/${endpoint}?${querystring.stringify(params)}`,
			method: 'GET',
			headers: {
				Authorization: `Bearer ${maskToken ? '****' : API_TOKEN}`,
				'Content-Type': 'application/json;charset=utf-8',
				Connection: 'keep-alive'
			}
		};
	}

	/**
	 * Retries a request
	 *
	 * @async
	 * @param {function} resolve
	 * @param {function} reject
	 * @param {string} endpoint
	 * @param {Object} params
	 * @param {number} [retries=0]
	 * @private
	 */
	async _retryRequest(resolve, reject, endpoint, params, retries = 0) {
		if (retries++ >= MAX_RETRIES) {
			await this._handleError({
				message: 'Failed on request retry',
				requestParams: this._getRequestOptions(endpoint, params, true),
				retries
			});
			reject(`Failed retrying request ${retries} times`);
			return;
		}

		setTimeout(async () => {
			try {
				const response = await this.request(endpoint, params, false);
				console.log(`Retry attempt ${retries} succeeded`);
				resolve(response);
			} catch (error) {
				console.log(`Retry attempt ${retries} failed`)
				await this._retryRequest(resolve, reject, endpoint, params, retries);
			}
		}, retries * 1000);
	}

	/**
	 * Indexes the error
	 *
	 * @param {object} body
	 * @returns {Promise<*>}
	 * @private
	 */
	async _handleError(body) {
		body.source = this.constructor.name;

		return await esClient.request('index', {
			index: Elasticsearch.INDEX_ERRORS,
			body
		});
	}
}

module.exports = new TheMovieDb();
