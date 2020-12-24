'use strict'

const debug = process.env.DEBUG || false;

const Movie = require('../classes/Movie');
const tmdbClient = require('../classes/TheMovieDb');
const esClient = require('../classes/Elasticsearch');
const console = require('../classes/EmojiConsole');
const debugConsole = require('../classes/DebugConsole');
const ProgressLogger = require('../classes/ProgressLogger');

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
	let progressLogger;
	const processedCounts = {
		found: 0,
		indexed: 0
	};

	if (debug) {
		debugConsole.addLogging('Main', 0);
		progressLogger = new ProgressLogger(Movie.MAX_POPULAR_MOVIES);
	}

	while (movies = await Movie.fetchPopularBatched()) {
		await Promise.all(movies.map(async movie => {
			const response = await esClient.request('get', { index, id: movie.id });
			if (response && response.found) {
				processedCounts.found++;
			} else {
				await movie.fetchAdditionalDetails();
				await esClient.request('index', { index, id: movie.id, body: movie });
				processedCounts.indexed++;
			}

			if (debug) {
				debugConsole.clearLog('Main');
				debugConsole.addLog('Main', `Found ${processedCounts.found} movies`);
				debugConsole.addLog('Main', `Indexed ${processedCounts.indexed} movies`);
				progressLogger.setProcessed(processedCounts.found + processedCounts.indexed);
				const progressBar = progressLogger.getProgressBar();
				const percentComplete = progressLogger.getPercentComplete();
				const eta = progressLogger.getEta();
				debugConsole.addLog('Main', `${progressBar} ${percentComplete}% ETA: ${eta}`);
			}
		}));
	}
}

run()
	.then(() => setTimeout(process.exit, 1000))
	.catch(console.error);

process.on('SIGINT', () => {
	process.exit();
});

process.on('exit', () => {
	tmdbClient.report();
	esClient.report();
});
