'use strict'

const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });
const https = require('https');
const querystring = require('querystring');

const API_HOST = 'api.themoviedb.org';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZWE0MzdhNjFhYThkNGUyZDk4NGQ2NzNkMTMyYjkxYiIsInN1YiI6IjVlN2NiODhhNmM3NGI5NTc1N2NhNDYzZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CGnvrBJ57Mny5PCFup7zE-NEqNbwB1qQmI2OH61naqI';
const index = 'movies';

async function run() {
	let page = 1;
	let totalPages = 0;
	const promises = [];
	const errors = [];

	do {
		console.log(`requesting page: ${page}`);
		try {
			const response = await fetch('movie/popular', {page});
			totalPages = response.total_pages;

			response.results.forEach(body => {
				const {id} = body;
				delete body.id;

				body.vote_average = body.vote_average.toFixed(2);
				if (!body.release_date) {
					delete body.release_date;
				}

				promises.push(client.index({id, index, body}).catch(err => errors.push(err)));
			});
		} catch (e) {
			errors.push(e.message);
		}
	} while (++page <= totalPages)

	await Promise.all(promises);

	client.indices.refresh({index}).catch(err => errors.push(err));

	if (errors.length) {
		console.log('Errors encountered!');
		errors.forEach(error => console.log(JSON.stringify(error)));
	}
}

async function search(match) {
	const { body } = await client.search({
		index,
		body: {
			query: {match}
		}
	});

	console.log(`Search Results: ${JSON.stringify(body)}`);
}

async function fetch(endpoint, params = {}) {
	const options = {
		hostname: API_HOST,
		port: 443,
		path: `/3/${endpoint}?${querystring.stringify(params)}`,
		method: 'GET',
		headers: {
			Authorization: `Bearer ${API_TOKEN}`,
			'Content-Type': 'application/json;charset=utf-8'
		}
	};

	return new Promise((resolve, reject) => {
		const req = https.request(options, res => {
			let chunks = '';

			res.on('data', chunk => {
				chunks += chunk;
			});

			res.on('end', () => {
				resolve(JSON.parse(chunks));
			});

			res.on('error', error => {
				reject(error);
			});
		});

		req.on('error', error => {
			reject(error);
		});

		req.end()
	});
}

run().then(() => search({title: 'the'})).catch(console.log);
