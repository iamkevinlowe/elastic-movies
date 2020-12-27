const Elasticsearch = require('./Elasticsearch');

const esClient = new Elasticsearch({ node: process.env.ES_HOST || 'http://es01:9200' });

class MovieReviews {
	/**
	 * Creates an instance of MovieReviews
	 *
	 * @param {Object} [properties={}]
	 */
	constructor(properties = {}) {
		Object.assign(this, properties);
	}

	/**
	 * Fetch movie review by the given ID
	 *
	 * @param {Object} [options={}]
	 * @returns {Promise<Object>}
	 */
	static async fetchById(options = {}) {
		options.index = this.INDEX;
		const response = await esClient.request('get', options);

		return response._source;
	}

	/**
	 * Fetch movie reviews by the given IDs
	 *
	 * @param {Object} [options={}]
	 * @param {Object} [body={}]
	 * @returns {Promise<Object>}
	 */
	static async fetchByIds(options = {}, body = {}) {
		options.index = this.INDEX;
		const response = await esClient.request('mget', { ...options, body });
		console.log(response);
		return response;
	}

	/**
	 * Returns the ES field mapping for MovieReviews
	 *
	 * @returns {{properties: {author_details: {properties: {avatar_path: {type: string}, name: {type: string}, rating: {type: string}, username: {type: string}}}, updated_at: {ignore_malformed: boolean, type: string}, author: {type: string}, created_at: {ignore_malformed: boolean, type: string}, id: {type: string}, content: {type: string}, url: {type: string}}}}
	 */
	static getIndexMapping() {
		return {
			properties: {
				author: { type: 'text' },
				author_details: {
					properties: {
						avatar_path: { type: 'text' },
						name: { type: 'text' },
						rating: { type: 'byte' },
						username: { type: 'text' }
					}
				},
				content: { type: 'text' },
				created_at: {
					type: 'date',
					ignore_malformed: true
				},
				id: { type: 'text' },
				updated_at: {
					type: 'date',
					ignore_malformed: true
				},
				url: { type: 'text' }
			}
		}
	}
}

MovieReviews.INDEX = 'movie_reviews';

module.exports = MovieReviews;
