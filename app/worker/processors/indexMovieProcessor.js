const Movie = require('../../classes/Movie');
const MovieReviews = require('../../classes/MovieReviews');
const MovieVideos = require('../../classes/MovieVideos');
const Elasticsearch = require('../../classes/Elasticsearch');
const Queue = require('../../classes/Queue');
const { capitalize } = require('../../utils/UtilString');

const esClient = new Elasticsearch();

const processor = async (job, done) => {
	if (job.data.adult) {
		done(null, `Skipping ${job.data.title}`);
		return;
	}

	const queue = (new Queue(Queue.NAME_INDEX_MOVIES)).getQueue();
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

		await movie.fetchAdditionalDetails();

		const { reviews = [], videos = [], recommendations = [], similar = [] } = movie;
		delete movie.reviews;
		delete movie.videos;
		delete movie.recommendations;
		delete movie.similar;

		// Reviews
		movie.review_ids = await Promise.all(reviews.map(async review => {
			if (!await isIndexed(MovieReviews.INDEX, review.id)) {
				await indexDocument(MovieReviews.INDEX, review);
			}
			return review.id;
		}));

		// Videos
		movie.video_ids = await Promise.all(videos.map(async video => {
			if (!await isIndexed(MovieVideos.INDEX, video.id)) {
				await indexDocument(MovieVideos.INDEX, video);
			}
			return video.id;
		}));

		// Recommendations
		movie.recommendation_ids = await Promise.all(recommendations.map(async recommendation => {
			// await queue.add(recommendation);

			// Index recommendation as is, without adding additional details
			if (!await isIndexed(Movie.INDEX, recommendation.id)) {
				await indexDocument(Movie.INDEX, recommendation);
			}
			return recommendation.id;
		}));

		// Similar
		movie.similar_ids = await Promise.all(similar.map(async sim => {
			// await queue.add(sim);

			// Index similar as is, without adding additional details
			if (!await isIndexed(Movie.INDEX, sim.id)) {
				await indexDocument(Movie.INDEX, sim);
			}
			return sim.id;
		}));

		const { result } = await indexDocument(Movie.INDEX, movie);
		done(null, `${capitalize(result)} ${movie.title}`);
	} catch (e) {
		console.error('Failed indexing movie', e);

		// Pause the queue for 1 minute
		await queue.pause();
		setTimeout(() => queue.resume(), 60000);

		done(e.message);
	}
};

/**
 * Returns true if movie is indexed
 *
 * @param {string} index
 * @param {number} id
 * @returns {Promise<boolean>}
 * @async
 */
const isIndexed = async (index, id) => {
	const response = await esClient.request('get', { index, id });
	return response.found;
};

/**
 * Index a document
 *
 * @param {string} index
 * @param {Object} document
 * @returns {Promise<Object>}
 */
const indexDocument = async (index, document) => {
	return await esClient.request('index', { index, id: document.id, body: document });
};

module.exports = processor;
