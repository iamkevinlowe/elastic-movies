const Movie = require('../../classes/Movie');
const MovieReviews = require('../../classes/MovieReviews');
const MovieVideos = require('../../classes/MovieVideos');
const Elasticsearch = require('../../classes/Elasticsearch');
const {
	QUEUE_NAME_MOVIE_INDEXING,
	getQueue
} = require('../queues');

const esClient = new Elasticsearch({ node: process.env.ES_HOST });

module.exports = async () => {
	if (!await esClient.ping()) {
		throw new Error('Failed to establish connection to Elasticsearch. Exiting Job.');
	}

	await createIndexIfNotExists(Movie.INDEX, Movie.getIndexMapping());
	await createIndexIfNotExists(MovieReviews.INDEX, MovieReviews.getIndexMapping());
	await createIndexIfNotExists(MovieVideos.INDEX, MovieVideos.getIndexMapping());

	let movies;

	const queue = getQueue(QUEUE_NAME_MOVIE_INDEXING);

	await queue.empty();
	while (movies = await Movie.fetchPopularBatched()) {
		await Promise.all(movies.map(movie => queue.add(movie)));
	}
};

const createIndexIfNotExists = async (index, mappings) => {
	if (!await esClient.request('indices.exists', { index })) {
		await esClient.request('indices.create', {
			index,
			body: { mappings }
		});
	}
};
