'use strict'

const debug = process.env.DEBUG || false;

const Movie = require('../classes/Movie');
const tmdbClient = require('../classes/TheMovieDb');
const esClient = require('../classes/Elasticsearch');
const console = require('../classes/EmojiConsole');
const debugConsole = require('../classes/DebugConsole');

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
		const startTime = +new Date();
		debugConsole.addLogging('Main', 0);
		logInterval = setInterval(() => {
			debugConsole.clearLog('Main');
			debugConsole.addLog('Main', `Found ${processedCounts.found} movies`);
			debugConsole.addLog('Main', `Indexed ${processedCounts.indexed} movies`);
			const { progressBar, percent, eta } = getProgress(startTime, processedCounts.found + processedCounts.indexed, Movie.MAX_POPULAR_MOVIES);
			debugConsole.addLog('Main', `${progressBar} ${percent}% ETA: ${eta}`);
		}, 5000);
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
 * Returns progress information
 *
 * @param {Number} startTime
 * @param {Number} processed
 * @param {Number} total
 * @returns {{eta: String, progressBar: String, percent: String}}
 */
function getProgress(startTime, processed, total) {
	const percentComplete = processed / total;
	const progressChars = 50;
	let progressBar = '';
	for (let i = 0; i < progressChars; i++) {
		progressBar += (i / progressChars) < percentComplete ? '\u2588' : '\u2591';
	}

	const percent = (percentComplete * 100).toFixed(2);

	let eta = '';
	if (processed) {
		const timePerProcessed = (+new Date() - startTime) / processed;
		const timeRemainingSeconds = (total - processed) * timePerProcessed / 1000;

		const days = Math.floor(timeRemainingSeconds / 86400);
		const hours = Math.floor((timeRemainingSeconds % 86400) / 3600);
		const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
		const seconds = Math.floor(timeRemainingSeconds % 60);
		if (days) {
			eta += `${days}d `;
		}
		if (hours) {
			eta += `${hours}h `;
		}
		if (minutes) {
			eta += `${minutes}m `;
		}
		if (seconds) {
			eta += `${seconds}s`;
		}
		eta = eta.trim();
	} else {
		eta = '...';
	}

	return { progressBar, percent, eta };
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

run()
	.then(() => process.exit())
	.catch(console.error);

process.on('SIGINT', () => {
	process.exit();
});

process.on('exit', () => {
	tmdbClient.report();
	esClient.report();
});
