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

	/**
	 * Reports what happened
	 */
	report() {
		this._reporter.report();
	}

	/**
	 * Updates the field mappings for the given index
	 *
	 * @async
	 * @param {String} index
	 * @param {Object} mappings
	 * @returns {Promise<void>}
	 */
	async updateMapping(index, mappings) {
		const clonedIndex = `${index}_clone`;

		await this.request('indices.create', {
			index: clonedIndex,
			body: { mappings }
		});

		await this.request('indices.putSettings', {
			index,
			body: { 'index.blocks.write': true }
		});

		await this.request('reindex', {
			body: {
				source: { index },
				dest: { index: clonedIndex }
			}
		});

		await this.request('indices.delete', {
			index
		});

		await this.request('indices.putSettings', {
			index: clonedIndex,
			body: { 'index.blocks.write': true }
		});

		await this.request('reindex', {
			body: {
				source: { index: clonedIndex },
				dest: { index }
			}
		});

		await this.request('indices.delete', {
			index: clonedIndex
		});
	}

	/**
	 * Makes a request to Elasticsearch
	 *
	 * @async
	 * @param {String} endpoint
	 * @param {Object} params
	 * @returns {Promise<*>}
	 */
	async request(endpoint, params) {
		// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html

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
			this._reporter.addError(e.meta && e.meta.body || e);
		}

		this._reporter.time(timeId);
	}
}

module.exports = Elasticsearch;
