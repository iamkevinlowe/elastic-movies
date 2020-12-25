const Movie = require('../../classes/Movie');
const Elasticsearch = require('../../classes/Elasticsearch');
const { movieIndexQueue } = require('../queues');

const esClient = new Elasticsearch({ node: process.env.ES_HOST });

module.exports = async (job, done) => {
	const movie = new Movie(job.data);

	try {
		const response = await esClient.request('get', { index: Movie.INDEX, id: movie.id });

		if (response && response.found) {
			done(null, `Found ${movie.title}`);
		} else {
			await movie.fetchAdditionalDetails();
			movie.similar.forEach(movie => movieIndexQueue.add(movie));
			movie.recommendations.forEach(movie => movieIndexQueue.add(movie));
			await esClient.request('index', { index: Movie.INDEX, id: movie.id, body: movie });
			done(null, `Indexed ${movie.title}`);
		}
	} catch (e) {
		console.error('Failed indexing movie', e);
		done(e.message);
	}
};
