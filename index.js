'use strict'

const debug = process.env.DEBUG || false;

const TheMovieDb = require('./classes/TheMovieDb');
const tmdbClient = new TheMovieDb({ debug });

const Elasticsearch = require('./classes/Elasticsearch');
const esClient = new Elasticsearch('http://localhost:9200', { debug });

const index = 'movies';
const indexMapping = {
	original_language: {
		type: 'text'
	},
	original_title: {
		type: 'text'
	},
	overview: {
		type: 'text'
	},
	popularity: {
		type: 'float'
	},
	release_date: {
		type: 'date',
		ignore_malformed: true
	},
	title: {
		type: 'text'
	},
	vote_average: {
		type: 'float'
	},
	vote_count: {
		type: 'long'
	}
};

async function run() {
	const indexExists = await esClient.request('indices.exists', { index });
	if (!indexExists) {
		await esClient.request('indices.create', { index });
		await esClient.request('indices.putMapping', {
			index,
			body: { properties: indexMapping }
		});
	}

	let page = 1;
	let totalPages = 0;
	const promises = [];

	do {
		console.log(`requesting page: ${page}`);
		const response = await tmdbClient.getMoviesPopular(page);
		if (!response) {
			continue;
		}

		totalPages = response.total_pages;

		response.results.forEach(body => {
			const { id } = body;

			Object.keys(body).forEach(key => {
				if (typeof indexMapping[key] === 'undefined') {
					delete body[key];
				}
			});

			promises.push(esClient.request('index', { id, index, body }));
		});
	} while (++page <= totalPages)

	await Promise.all(promises);
	await esClient.request('indices.refresh', { index });

	if (debug) {
		tmdbClient.report();
		esClient.report();
	}
}

async function search(match) {
	const { body } = await esClient.request('search', {
		index,
		body: {
			query: { match }
		}
	});

	console.log(`Search Results: ${JSON.stringify(body)}`);
}

run().catch(console.error);
