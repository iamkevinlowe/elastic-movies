'use strict'

const https = require('https');
const querystring = require('querystring');
const console = require('./EmojiConsole');
const Reporter = require('./Reporter');

const API_HOST = 'api.themoviedb.org';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZWE0MzdhNjFhYThkNGUyZDk4NGQ2NzNkMTMyYjkxYiIsInN1YiI6IjVlN2NiODhhNmM3NGI5NTc1N2NhNDYzZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CGnvrBJ57Mny5PCFup7zE-NEqNbwB1qQmI2OH61naqI';
const API_PAGE_LIMIT = 1000;

class TheMovieDb {
	constructor(config = {}) {
		this._config = config;
		this._reporter = new Reporter(this.constructor.name);
		this._lastRequestForPagination = null;
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
	 * @returns {Promise<*>}
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
							&& response.page < response.total_pages
							&& response.page < API_PAGE_LIMIT - 1
						) {
							this._lastRequestForPagination = {
								endpoint,
								params
							};

							resolve(response.results);
						} else {
							this._lastRequestForPagination = null;
							resolve(response);
						}
					} catch (e) {
						this._reporter.addError(e);
						resolve();
					} finally {
						this._reporter.time(timeId);
					}
				});

				res.on('error', error => {
					this._reporter.addError(error);
					resolve();
					this._reporter.time(timeId);
				});
			});

			req.on('error', error => {
				this._reporter.addError(error);
				resolve();
				this._reporter.time(timeId);
			});

			req.end()
		});
	}

	/**
	 * Fetches the next page of results
	 *
	 * @returns {Promise<*>}
	 */
	async getNextPage() {
		if (!this._lastRequestForPagination) {
			return;
		}

		const { endpoint, params } = this._lastRequestForPagination;
		this._lastRequestForPagination = null;
		params.page++;

		if (params.page > API_PAGE_LIMIT) {
			return;
		}

		return await this.request(endpoint, params);
	}
}

module.exports = TheMovieDb;
