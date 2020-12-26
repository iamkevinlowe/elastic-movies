const Movie = require('../../classes/Movie');
const Elasticsearch = require('../../classes/Elasticsearch');
const { movieIndexQueue } = require('../queues');

const esClient = new Elasticsearch({ node: process.env.ES_HOST });

module.exports = async () => {
	if (!await esClient.ping()) {
		console.warn('Failed to establish connection to Elasticsearch. Exiting Job.');
		return;
	}

	try {
		const indexExists = await esClient.request('indices.exists', { index: Movie.INDEX });
		if (!indexExists) {
			await esClient.request('indices.create', { index: Movie.INDEX });
			await esClient.request('indices.putMapping', {
				index: Movie.INDEX,
				body: Movie.getIndexMapping()
			});
		}
	} catch (e) {
		console.error('Failed creating index', e);
		return;
	}

	let movies;

	try {
		await movieIndexQueue.empty();
		while (movies = await Movie.fetchPopularBatched()) {
			movies.forEach(movie => movieIndexQueue.add(movie));
		}
	} catch (e) {
		console.error('Failed fetching popular movies', e);
	}
};
