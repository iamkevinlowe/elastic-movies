const Elasticsearch = require('./Elasticsearch');

const esClient = new Elasticsearch({ node: process.env.ES_HOST });

class MovieVideos {
	/**
	 * Creates an instance of MovieVideos
	 *
	 * @param {Object} [properties={}]
	 */
	constructor(properties = {}) {
		Object.assign(this, properties);
	}

	/**
	 * Fetch movie video by the given ID
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
	 * Fetch movie videos by the given IDs
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
	 * Returns the ES field mapping for MovieVideos
	 *
	 * @returns {{properties: {site: {type: string}, size: {type: string}, iso_3166_1: {type: string}, name: {type: string}, id: {type: string}, type: {type: string}, iso_639_1: {type: string}, key: {type: string}}}}
	 */
	static getIndexMapping() {
		return {
			properties: {
				id: { type: 'text' },
				iso_639_1: { type: 'keyword' },
				iso_3166_1: { type: 'keyword' },
				key: { type: 'text' },
				name: { type: 'text' },
				site: { type: 'keyword' },
				size: { type: 'short' },
				type: { type: 'keyword' }
			}
		}
	}
}

MovieVideos.INDEX = 'movie_videos';

module.exports = MovieVideos;
