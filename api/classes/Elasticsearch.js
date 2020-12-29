const { Client } = require('@elastic/elasticsearch');
const { capitalize } = require('../classes/UtilString');

class Elasticsearch {
	/**
	 * Creates an instance of Elasticsearch
	 */
	constructor(options = {}) {
		this._client = new Client(options);
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
	 * @param {string} index
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
	 * Transfers documents from this client's nodes to the given
	 * client's nodes
	 *
	 * @param {Elasticsearch} newEsClient
	 * @param {string} index
	 * @param {Object} mappings
	 * @returns {Promise<void>}
	 * @async
	 */
	async transferToNewNode(newEsClient, index, mappings) {
		if (!await this.ping()) {
			throw new Error('Source is NOT connected');
		}

		if (!await newEsClient.ping()) {
			throw new Error('Destination is NOT connected');
		}

		if (!await this.request('indices.exists', { index })) {
			throw new Error(`Index [${index}] does not exist in Source`);
		}

		if (!await newEsClient.request('indices.exists', { index })) {
			await newEsClient.request('indices.create', { index });
			await newEsClient.request('indices.putMapping', {
				index,
				body: mappings
			});
		}

		let total = 0;
		let processed = 0;
		let scroll_id;

		do {
			const response = scroll_id
				? await this.request('scroll', { scroll: '1m', scroll_id })
				: await this.request('search', { index, scroll: '1m' });

			scroll_id = response._scroll_id;
			total = total || response.hits.total.value;

			await Promise.all(response.hits.hits.map(async ({ _source: item }) => {
				let result;

				if (!item.id) {
					console.log('No ID found!', item);
					result = 'skipped';
				} else {
					const options = { index, id: item.id };
					const getResponse = await newEsClient.request('get', options);
					if (getResponse.found) {
						result = 'found';
					} else {
						const indexResponse = await newEsClient.request('index', { ...options, body: item });
						result = indexResponse.result;
					}
					await this.request('delete', { index, id: item.id });
				}

				processed++;
				console.log(`${processed}/${total} - ${capitalize(result)} ${item.title}`);
			}));
		} while (scroll_id && processed < total)
	}

	/**
	 * Makes a request to Elasticsearch
	 * [API Docs]{@link https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html}
	 *
	 * @async
	 * @param {string} endpoint
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
		if (response.statusCode >= 400) {
			const error = new Error(response.body.error.caused_by.reason);
			Object.assign(error, response.body.error);
			throw error;
		}
		return response.body;
	}
}

module.exports = Elasticsearch;
