const Movie = require('../../classes/Movie');
const Elasticsearch = require('../../classes/Elasticsearch');
const { movieIndexQueue } = require('../queues');

const esClient = new Elasticsearch({ node: process.env.ES_HOST });

const processor = async (job, done) => {
	const movie = new Movie(job.data);
	try {
		if (!await esClient.ping(30000)) {
			throw new Error('Failed to establish connection to Elasticsearch');
		}

		const healthResponse = await esClient.request('cluster.health', { index: Movie.INDEX, waitForStatus: 'green' });
		if (healthResponse.timed_out) {
			console.log(healthResponse);
			throw new Error('Timed out waiting for cluster to go green');
		}

		if (await isIndexed(movie)) {
			done(null, `Found ${movie.title}`);
		} else {
			await movie.fetchAdditionalDetails();
			await Promise.all(movie.similar.map(async movie => {
				if (!await isIndexed(movie)) {
					return movieIndexQueue.add(movie);
				}
			}));
			await Promise.all(movie.recommendations.map(async movie => {
				if (!await isIndexed(movie)) {
					return movieIndexQueue.add(movie)
				}
			}));
			await esClient.request('index', { index: Movie.INDEX, id: movie.id, body: movie });
			done(null, `Indexed ${movie.title}`);
		}
	} catch (e) {
		console.error('Failed indexing movie', e);

		// Pause the queue for 1 minute
		await movieIndexQueue.pause();
		setTimeout(() => movieIndexQueue.resume(), 60000);

		done(e.message);
	}
};

/**
 * Returns true if movie is indexed
 *
 * @param {Object} movie
 * @returns {Promise<boolean>}
 * @async
 */
const isIndexed = async movie => {
	const response = await esClient.request('get', { index: Movie.INDEX, id: movie.id });
	return response.found;
};

module.exports = processor;
