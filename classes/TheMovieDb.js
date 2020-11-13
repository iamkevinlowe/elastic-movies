'use strict'

const https = require('https');
const querystring = require('querystring');
const console = require('./EmojiConsole');
const Reporter = require('./Reporter');

const API_HOST = 'api.themoviedb.org';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZWE0MzdhNjFhYThkNGUyZDk4NGQ2NzNkMTMyYjkxYiIsInN1YiI6IjVlN2NiODhhNmM3NGI5NTc1N2NhNDYzZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CGnvrBJ57Mny5PCFup7zE-NEqNbwB1qQmI2OH61naqI';

class TheMovieDb {
	constructor(config = {}) {
		this._config = config;
		this._reporter = new Reporter(this.constructor.name);
	}

	report() {
		this._reporter.report();
	}

	async getMoviesPopular(page = 1) {
		return await this._request('movie/popular', { page });
	}

	async _request(endpoint, params = {}) {
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
					const response = JSON.parse(chunks);

					if (this.debug) {
						console.info(response);
					}

					resolve(response);
					this._reporter.time(timeId);
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
}

module.exports = TheMovieDb;
