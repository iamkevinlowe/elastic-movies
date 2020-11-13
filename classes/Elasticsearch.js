'use strict'

const { Client } = require('@elastic/elasticsearch');
const console = require('./EmojiConsole');
const Reporter = require('./Reporter');

class Elasticsearch {
	constructor(node, config = {}) {
		this._client = new Client({ node });
		this._config = config;
		this._reporter = new Reporter(this.constructor.name);
	}

	report() {
		this._reporter.report();
	}

	async request(endpoint, params) {
		const timeId = this._reporter.time();

		const [namespace, verb] = endpoint.split('.');

		let method = this._client[namespace];
		if (verb && method) {
			method = method[verb];
		}

		if (typeof method !== 'function') {
			this._reporter.time(timeId);
			throw new Error(`Invalid endpoint: ${endpoint}`);
		}

		try {
			const response = await method.call(this._client, params);

			if (this._config.debug) {
				console.info(response);
			}

			this._reporter.time(timeId);
			return response.body;
		} catch (e) {
			this._reporter.addError(e.meta.body);
		}

		this._reporter.time(timeId);
	}
}

module.exports = Elasticsearch;
