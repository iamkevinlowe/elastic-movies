'use strict'

const debug = process.env.DEBUG || false;

const TheMovieDb = require('./classes/TheMovieDb');
const tmdbClient = new TheMovieDb({ debug });

const Elasticsearch = require('./classes/Elasticsearch');
const esClient = new Elasticsearch({ debug });

const index = 'movies';
const indexMappingMovies = {
	backdrop_path: { type: 'text' },
	genre_ids: { type: 'integer' },
	id: { type: 'integer' },
	original_language: { type: 'keyword' },
	original_title: { type: 'text' },
	overview: { type: 'text' },
	popularity: { type: 'float' },
	poster_path: { type: 'text' },
	release_date: {
		type: 'date',
		ignore_malformed: true
	},
	title: { type: 'text' },
	video: { type: 'boolean' },
	vote_average: { type: 'float' },
	vote_count: { type: 'long' }
};
const indexMappingMoviesDetails = {
	belongs_to_collection: {
		properties: {
			backdrop_path: { type: 'text' },
			id: { type: 'integer' },
			name: { type: 'keyword' },
			poster_path: { type: 'text' }
		}
	},
	budget: { type: 'integer' },
	genres: {
		properties: {
			id: { type: 'integer' },
			name: { type: 'keyword' }
		}
	},
	homepage: { type: 'text' },
	imdb_id: { type: 'text' },
	production_companies: {
		properties: {
			id: { type: 'integer' },
			logo_path: { type: 'text' },
			name: { type: 'keyword' },
			origin_country: { type: 'keyword' }
		}
	},
	production_countries: {
		properties: {
			iso_3166_1: { type: 'keyword' },
			name: { type: 'text' }
		}
	},
	revenue: { type: 'integer' },
	runtime: { type: 'short' },
	spoken_languages: {
		properties: {
			english_name: { type: 'keyword' },
			iso_639_1: { type: 'keyword' },
			name: { type: 'keyword' }
		}
	},
	status: { type: 'keyword' },
	tagline: { type: 'text' }
};
const indexMappingCast = {
	cast_id: { type: 'integer' },
	character: { type: 'text' },
	credit_id: { type: 'text' },
	gender: { type: 'byte' },
	id: { type: 'integer' },
	known_for_department: { type: 'keyword' },
	name: { type: 'text' },
	order: { type: 'integer' },
	original_name: { type: 'text' },
	popularity: { type: 'integer' },
	profile_path: { type: 'text' }
};
const indexMappingCrew = {
	credit_id: { type: 'text' },
	department: { type: 'keyword' },
	gender: { type: 'byte' },
	id: { type: 'integer' },
	job: { type: 'keyword' },
	known_for_department: { type: 'keyword' },
	name: { type: 'text' },
	original_name: { type: 'text' },
	popularity: { type: 'integer' },
	profile_path: { type: 'text' }
};
const indexMappingKeywords = {
	id: { type: 'integer' },
	name: { type: 'keyword' }
};
const indexMappingReviews = {
	author: { type: 'text' },
	author_details: {
		properties: {
			avatar_path: { type: 'text' },
			name: { type: 'text' },
			rating: { type: 'byte' },
			username: { type: 'text' }
		}
	},
	content: { type: 'text' },
	created_at: {
		type: 'date',
		ignore_malformed: true
	},
	id: { type: 'text' },
	updated_at: {
		type: 'date',
		ignore_malformed: true
	},
	url: { type: 'text' }
};
const indexMappingVideos = {
	id: { type: 'text' },
	iso_639_1: { type: 'keyword' },
	iso_3166_1: { type: 'keyword' },
	key: { type: 'text' },
	name: { type: 'text' },
	site: { type: 'keyword' },
	size: { type: 'short' },
	type: { type: 'keyword' }
};
const indexMapping = {
	properties: {
		...indexMappingMovies,
		...indexMappingMoviesDetails,
		credits: {
			properties: {
				cast: { properties: indexMappingCast },
				crew: { properties: indexMappingCrew }
			}
		},
		keywords: { properties: indexMappingKeywords },
		recommendations: { properties: indexMappingMovies },
		reviews: { properties: indexMappingReviews },
		similar: { properties: indexMappingMovies },
		videos: { properties: indexMappingVideos }
	}
};

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
			body: indexMapping
		});
	}
}

/**
 * Indexes popular movies from The Movie DB
 *
 * @async
 */
async function indexMoviesPopular() {
	const moviesResponse = await tmdbClient.request('movie/popular', { page: 1 });
	let movies = moviesResponse.getResponse();

	do {
		await Promise.all(movies.map(async movie => {
			removeUnmappedProperties(movie, indexMappingMovies);
			Object.assign(movie, await getMovieDetails(movie.id));
			return esClient.request('index', { id: movie.id, index, body: movie });
		}));
	} while (movies = await moviesResponse.getNextResponse())
}

/**
 * Removes properties from the given item that have no ES field mapping
 *
 * @param {Object} item
 * @param {Object} mapping
 */
function removeUnmappedProperties(item, mapping) {
	Object.keys(item).forEach(key => {
		if (typeof mapping[key] === 'undefined') {
			delete item[key];
		}
	});
}

/**
 * Gets additional details for a given movie ID
 *
 * @async
 * @param {Number} id
 * @returns {Promise<Object>}
 */
async function getMovieDetails(id) {
	const movieDetailsResponse = await tmdbClient.request(`movie/${id}`, { append_to_response: 'credits,keywords,recommendations,reviews,similar,videos' });
	const {
		credits: {
			cast = [],
			crew = []
		} = {},
		keywords: { keywords = [] } = {},
		recommendations: {
			results: recommendations = [],
			total_pages: recommendationTotalPages = 0
		} = {},
		reviews: {
			results: reviews = [],
			total_pages: reviewsTotalPages = 0
		} = {},
		similar: {
			results: similar = [],
			total_pages: similarTotalPages = 0
		} = {},
		videos: { results: videos = [] } = {},
		...movie
	} = movieDetailsResponse.getResponse() || {};

	if (recommendationTotalPages > 1) {
		Array.prototype.push.apply(recommendations, await getPaginatedResults(`movie/${movie.id}/recommendations`, 2));
	}

	if (reviewsTotalPages > 1) {
		Array.prototype.push.apply(reviews, await getPaginatedResults(`movie/${movie.id}/reviews`, 2));
	}

	if (similarTotalPages > 1) {
		Array.prototype.push.apply(similar, await getPaginatedResults(`movie/${movie.id}/similar`, 2));
	}

	cast.forEach(item => removeUnmappedProperties(item, indexMappingCast));
	crew.forEach(item => removeUnmappedProperties(item, indexMappingCrew));
	keywords.forEach(item => removeUnmappedProperties(item, indexMappingKeywords));
	recommendations.forEach(item => removeUnmappedProperties(item, indexMappingMovies));
	reviews.forEach(item => removeUnmappedProperties(item, indexMappingReviews));
	similar.forEach(item => removeUnmappedProperties(item, indexMappingMovies));
	videos.forEach(item => removeUnmappedProperties(item, indexMappingVideos));
	removeUnmappedProperties(movie, indexMappingMoviesDetails);

	Object.assign(movie, {
		credits: {
			cast,
			crew
		},
		keywords,
		recommendations,
		reviews,
		similar,
		videos
	});

	return movie;
}

/**
 * Gets the full list of results of a paginated result set
 *
 * @async
 * @param {String} endpoint
 * @param {Number} page
 * @returns {Promise<Object[]>}
 */
async function getPaginatedResults(endpoint, page = 1) {
	const paginatedResponse = await tmdbClient.request(endpoint, { page });
	const results = paginatedResponse.getResponse();
	let items;

	while (items = await paginatedResponse.getNextResponse()) {
		Array.prototype.push.apply(results, items);
	}

	return results;
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
	await esClient.updateMapping(index, indexMapping);
	esClient.report();
}

run()
	.then(() => {
		tmdbClient.report();
		esClient.report();
	})
	.catch(console.error);
