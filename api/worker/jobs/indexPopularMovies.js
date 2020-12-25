const Movie = require('../../classes/Movie');
const esClient = require('../../classes/Elasticsearch');
const { movieIndexQueue } = require('../queues');

module.exports = async () => {
	const isConnected = await esClient.ping();
	if (!isConnected) {
		console.warn('Failed to connect to Elasticsearch. Exiting Job.');
		return;
	}

	const indexExists = await esClient.request('indices.exists', { index: Movie.INDEX });
	if (!indexExists) {
		await esClient.request('indices.create', { index: Movie.INDEX });
		await esClient.request('indices.putMapping', {
			index: Movie.INDEX,
			body: Movie.getIndexMapping()
		});
	}

	let movies;

	while (movies = await Movie.fetchPopularBatched()) {
		movies.forEach(movie => movieIndexQueue.add(movie));
	}
};
