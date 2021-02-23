const https = require('https');
const querystring = require('querystring');
const ApiResponse = require('./ApiResponse');

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
		const options = {
			hostname: API_HOST,
			port: 443,
			path: `/3/${endpoint}?${querystring.stringify(params)}`,
			method: 'GET',
			headers: {
				Authorization: `Bearer ${API_TOKEN}`,
				'Content-Type': 'application/json;charset=utf-8',
				'Connection': 'keep-alive'
			}
		};

		return new Promise((resolve, reject) => {
			const req = https.request(options, res => {
				const chunks = [];

				res.on('data', chunk => chunks.push(chunk));

				res.on('end', async () => {
					const apiResponse = new ApiResponse();
					if (res.statusCode !== 200 || !/application\/json/.test(res.headers['content-type'])) {
						// 502, Bad Gateway
						// 404, Not Found
						console.log('ERROR!! TheMoveDB messed up on end Unexpected response: ', res, chunks.join(''));
						reject(new Error(res.statusMessage));
						return;
					}

					try {
						const response = JSON.parse(chunks.join(''));

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
						console.log('ERROR!! TheMovieDB messed up on end', error);
						console.log('Chunks:', chunks.join(''));
						if (
							canRetry
							&& ERROR_CODES_RETRYABLE.includes(error.code)
						) {
							this._retryRequest(resolve, reject, endpoint, params);
						} else {
							reject(error);
						}
					}
				});

				res.on('error', error => {
					console.log('ERROR!! TheMovieDB messed up on response', error);
					if (
						canRetry
						&& ERROR_CODES_RETRYABLE.includes(error.code)
					) {
						this._retryRequest(resolve, reject, endpoint, params);
					} else {
						reject(error);
					}
				});
			});

			req.on('error', error => {
				if (
					canRetry
					&& ERROR_CODES_RETRYABLE.includes(error.code)
				) {
					this._retryRequest(resolve, reject, endpoint, params);
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
	 * Retries a request
	 *
	 * @param {function} resolve
	 * @param {function} reject
	 * @param {string} endpoint
	 * @param {Object} params
	 * @param {number} [retries=0]
	 * @private
	 */
	_retryRequest(resolve, reject, endpoint, params, retries = 0) {
		if (retries++ >= MAX_RETRIES) {
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
				this._retryRequest(resolve, reject, endpoint, params, retries);
			}
		}, retries * 1000);
	}
}

module.exports = new TheMovieDb();
