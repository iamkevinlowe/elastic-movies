const https = require('https');
const querystring = require('querystring');
const ApiResponse = require('./ApiResponse');

const API_HOST = 'api.themoviedb.org';
const API_TOKEN = process.env.TMDB_API_TOKEN;
const API_PAGE_LIMIT = 1000;

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
	 * @returns {Promise<ApiResponse>}
	 */
	async request(endpoint, params = {}) {
		const options = {
			hostname: API_HOST,
			port: 443,
			path: `/3/${endpoint}?${querystring.stringify(params)}`,
			method: 'GET',
			headers: {
				Authorization: `Bearer ${API_TOKEN}`,
				'Content-Type': 'application/json;charset=utf-8'
			}
		};

		return new Promise((resolve, reject) => {
			const req = https.request(options, res => {
				let chunks = '';

				res.on('data', chunk => chunks += chunk);

				res.on('end', () => {
					const apiResponse = new ApiResponse();

					try {
						const response = JSON.parse(chunks);

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
					} catch (e) {
						reject(e);
					}
				});

				res.on('error', error => reject(error));
			});

			req.on('error', error => reject(error));

			req.end()
		});
	}
}

module.exports = new TheMovieDb();
