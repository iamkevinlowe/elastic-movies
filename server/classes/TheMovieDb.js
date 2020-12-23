'use strict'

const https = require('https');
const querystring = require('querystring');
const debugConsole = require('./DebugConsole');
const Reporter = require('./Reporter');
const ApiResponse = require('./ApiResponse');

const API_HOST = 'api.themoviedb.org';
const API_TOKEN = process.env.TMDB_API_TOKEN;
const API_PAGE_LIMIT = 1000;

class TheMovieDb {
	/**
	 * Creates an instance of TheMovieDB
	 *
	 * @param {Object} [config={}]
	 */
	constructor(config = {}) {
		this._config = config;
		this._reporter = new Reporter(this.constructor.name);
	}

	/**
	 * Reports what happened
	 */
	report() {
		this._reporter.report();
	}

	/**
	 * Makes an api request to The Movie DB
	 * [API Docs]{@link https://developers.themoviedb.org/3/getting-started/introduction}
	 *
	 * @async
	 * @param {String} endpoint
	 * @param {Object} [params={}]
	 * @returns {Promise<ApiResponse>}
	 */
	async request(endpoint, params = {}) {
		if (this._config.debug) {
			const { ...debugParams } = params;
			debugConsole.addLog(this.constructor.name, `Requesting ${endpoint}`, debugParams);
		}

		const timeId = this._reporter.time();

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

		return new Promise(resolve => {
			const apiResponse = new ApiResponse();

			const req = https.request(options, res => {
				let chunks = '';

				res.on('data', chunk => {
					chunks += chunk;
				});

				res.on('end', () => {
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
					} catch (e) {
						this._reporter.addError(e);
					} finally {
						resolve(apiResponse);
						this._reporter.time(timeId);
					}
				});

				res.on('error', error => {
					this._reporter.addError(error);
					resolve(apiResponse);
					this._reporter.time(timeId);
				});
			});

			req.on('error', error => {
				this._reporter.addError(error);
				resolve(apiResponse);
				this._reporter.time(timeId);
			});

			req.end()
		});
	}
}

module.exports = new TheMovieDb({ debug: process.env.DEBUG || false });
