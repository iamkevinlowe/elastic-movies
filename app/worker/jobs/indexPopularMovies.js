const Movie = require('../../classes/Movie');
const MovieReviews = require('../../classes/MovieReviews');
const MovieVideos = require('../../classes/MovieVideos');
const Elasticsearch = require('../../classes/Elasticsearch');
const Queue = require('../../classes/Queue');

const esClient = new Elasticsearch();

module.exports = async () => {
	if (!await esClient.ping()) {
		throw new Error('Failed to establish connection to Elasticsearch. Exiting Job.');
	}

	await createIndexIfNotExists(Movie.INDEX, Movie.getIndexMapping());
	await createIndexIfNotExists(MovieReviews.INDEX, MovieReviews.getIndexMapping());
	await createIndexIfNotExists(MovieVideos.INDEX, MovieVideos.getIndexMapping());

	let movies;

	const queue = (new Queue(Queue.NAME_INDEX_MOVIES)).getQueue();

	await queue.empty();
	while (movies = await Movie.fetchPopularBatched()) {
		await Promise.all(movies.map(movie => queue.add(movie)));
	}
};

/**
 * Checks if an index exists.  If not, it'll create it with the given field mappings
 *
 * @param {string} index
 * @param {Object} mappings
 * @returns {Promise<void>}
 */
const createIndexIfNotExists = async (index, mappings) => {
	if (!await esClient.request('indices.exists', { index })) {
		await esClient.request('indices.create', {
			index,
			body: { mappings }
		});
	}
};
