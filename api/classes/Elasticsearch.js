const { Client } = require('@elastic/elasticsearch');

const ES_HOST = process.env.ES_HOST;

class Elasticsearch {
	/**
	 * Creates an instance of Elasticsearch
	 */
	constructor() {
		this._client = new Client({ node: ES_HOST });
	}

	/**
	 * Pings Elasticsearch for connection
	 *
	 * @param {Number} timeout Time in milliseconds to ping Elasticsearch
	 * @returns {Promise<boolean>}
	 * @async
	 */
	async ping(timeout = 5000) {
		return new Promise(resolve => {
			const intervalTime = 1000;
			const interval = setInterval(() => {
				if (timeout <= 0) {
					clearInterval(interval);
					resolve(false);
				} else {
					timeout -= intervalTime;
					this._client.ping({}, error => {
						if (!error) {
							clearInterval(interval);
							resolve(true);
						}
					});
				}
			}, intervalTime);
		});
	}

	/**
	 * Updates the field mappings for the given index
	 * Note: Broken
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
	 * [API Docs]{@link https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html}
	 *
	 * @async
	 * @param {String} endpoint
	 * @param {Object} params
	 * @returns {Promise<*>}
	 */
	async request(endpoint, params) {
		const [namespace, verb] = endpoint.split('.');

		let method = this._client[namespace];
		if (verb && method) {
			method = method[verb];
		}

		if (typeof method !== 'function') {
			throw new Error(`Invalid endpoint: ${endpoint}`);
		}

		const response = await method.call(this._client, params, { ignore: [404] });
		return response.body;
	}
}

module.exports = new Elasticsearch({ debug: process.env.DEBUG || false });
