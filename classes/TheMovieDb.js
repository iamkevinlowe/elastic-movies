'use strict'

const https = require('https');
const querystring = require('querystring');
const console = require('./EmojiConsole');
const Reporter = require('./Reporter');
const ApiResponse = require('./ApiResponse');

const API_HOST = 'api.themoviedb.org';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZWE0MzdhNjFhYThkNGUyZDk4NGQ2NzNkMTMyYjkxYiIsInN1YiI6IjVlN2NiODhhNmM3NGI5NTc1N2NhNDYzZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CGnvrBJ57Mny5PCFup7zE-NEqNbwB1qQmI2OH61naqI';
const API_PAGE_LIMIT = 1000;

class TheMovieDb {
	/**
	 * Creates an instance of TheMovieDB
	 *
	 * @param {Object} config
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
	 *
	 * @async
	 * @param endpoint
	 * @param params
	 * @returns {Promise<ApiResponse>}
	 */
	async request(endpoint, params = {}) {
		console.log(`Requesting ${endpoint}`, params);

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

		return new Promise((resolve, reject) => {
			const apiResponse = new ApiResponse();

			const req = https.request(options, res => {
				let chunks = '';

				res.on('data', chunk => {
					chunks += chunk;
				});

				res.on('end', () => {
					try {
						const response = JSON.parse(chunks);

						if (this.debug) {
							console.info(response);
						}

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

module.exports = TheMovieDb;
