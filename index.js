'use strict'

const debug = process.env.DEBUG || false;

const Movie = require('./classes/Movie');
const tmdbClient = require('./classes/TheMovieDb');
const esClient = require('./classes/Elasticsearch');

const index = 'movies';

/**
 * Main function that begins indexing movies
 *
 * @returns {Promise<void>}
 */
async function run() {
	await createIndexIfNotExists();
	await indexMoviesPopular();
	await esClient.request('indices.refresh', { index });
}

/**
 * Creates the ElasticSearch index if it does not exist
 *
 * @async
 * @returns {Promise<void>}
 */
async function createIndexIfNotExists() {
	const indexExists = await esClient.request('indices.exists', { index });
	if (!indexExists) {
		await esClient.request('indices.create', { index });
		await esClient.request('indices.putMapping', {
			index,
			body: Movie.getIndexMapping()
		});
	}
}

/**
 * Indexes popular movies from The Movie DB
 *
 * @async
 */
async function indexMoviesPopular() {
	let movies;
	let logInterval;
	const processedCounts = {
		found: 0,
		indexed: 0
	};

	if (debug) {
		logInterval = setInterval(() => {
			console.clear();
			console.info(`[Main] Found ${processedCounts.found} movies`);
			console.info(`[Main] Indexed ${processedCounts.indexed} movies`);
		}, 1000);
	}

	while (movies = await Movie.getPopularBatched()) {
		await Promise.all(movies.map(async movie => {
			const response = await esClient.request('get', { index, id: movie.id });
			if (response && response.found) {
				processedCounts.found++;
			} else {
				await movie.addDetails();
				processedCounts.indexed++;
				return esClient.request('index', { index, id: movie.id, body: movie });
			}
		}));
	}

	if (debug) {
		clearInterval(logInterval);
	}
}

/**
 * Searches the index by the given string
 *
 * @async
 * @param {String} match
 * @returns {Promise<void>}
 */
async function search(match) {
	const { body } = await esClient.request('search', {
		index,
		body: {
			query: { match }
		}
	});

	console.log(`Search Results: ${JSON.stringify(body)}`);
}

/**
 * Updates the field mappings for an index
 *
 * @async
 * @returns {Promise<void>}
 */
async function updateMapping() {
	await esClient.updateMapping(index, Movie.getIndexMapping());
	esClient.report();
}

run().catch(console.error);

process.on('SIGINT', () => {
	process.exit();
});

process.on('exit', () => {
	tmdbClient.report();
	esClient.report();
});
