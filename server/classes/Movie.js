const ApiResponse = require('./ApiResponse');
const tmdbClient = require('./TheMovieDb');
const esClient = require('./Elasticsearch');

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
	revenue: { type: 'long' },
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

class Movie {
	/**
	 * Creates an instance of Movie
	 *
	 * @param {Object} [properties={}]
	 */
	constructor(properties = {}) {
		Object.assign(this, properties);
	}

	/**
	 * Returns the ES field mapping for Movies
	 *
	 * @returns {Object}
	 */
	static getIndexMapping() {
		return {
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
	}

	/**
	 * Fetches a batched list of popular movies
	 * Subsequent calls will fetch the next batch of movies
	 *
	 * @returns {Promise<null|Movie[]>}
	 * @async
	 */
	static async fetchPopularBatched() {
		const results = [];
		let popularResponse;

		if (this._nextPopularResponse instanceof ApiResponse) {
			popularResponse = this._nextPopularResponse;
			this._nextPopularResponse = null;
			Array.prototype.push.apply(results, await popularResponse.getNextResponse() || []);
		} else if (this._nextPopularResponse === null) {
			popularResponse = await tmdbClient.request('movie/popular', { page: 1 });
			Array.prototype.push.apply(results, popularResponse.getResponse() || []);
		} else {
			this._nextPopularResponse = null;
			return null;
		}

		this._nextPopularResponse = popularResponse.hasNextResponse() ? popularResponse : -1;

		return results.map(result => {
			this._removeUnmappedProperties(result, indexMappingMovies);
			return new this(result);
		});
	}

	/**
	 * Fetches movies
	 *
	 * @param {Object} [options={}]
	 * @param {Object} [body={}]
	 * @returns {Promise<{}>}
	 */
	static async fetchSearchResult(options = {}, body = {}) {
		const response = await esClient.request('search', { ...options, body });

		if (response) {
			const { hits = {} } = response;
			hits.hits = await Promise.all(hits.hits.map(async item => {
				item._source = await this._replaceImagePaths(item._source);
				return item;
			}));

			return hits;
		} else {
			return { hits: [], total: { value: 0 } };
		}
	}

	/**
	 * Fetches additional details for the movie
	 *
	 * @returns {Promise<Movie>}
	 * @async
	 */
	async fetchAdditionalDetails() {
		const detailsResponse = await tmdbClient.request(`movie/${this.id}`, { append_to_response: 'credits,keywords,recommendations,reviews,similar,videos' });
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
		} = detailsResponse.getResponse() || {};

		if (recommendationTotalPages > 1) {
			Array.prototype.push.apply(recommendations, await this.constructor._fetchPaginatedResults(`movie/${movie.id}/recommendations`, 2));
		}

		if (reviewsTotalPages > 1) {
			Array.prototype.push.apply(reviews, await this.constructor._fetchPaginatedResults(`movie/${movie.id}/reviews`, 2));
		}

		if (similarTotalPages > 1) {
			Array.prototype.push.apply(similar, await this.constructor._fetchPaginatedResults(`movie/${movie.id}/similar`, 2));
		}

		cast.forEach(item => this.constructor._removeUnmappedProperties(item, indexMappingCast));
		crew.forEach(item => this.constructor._removeUnmappedProperties(item, indexMappingCrew));
		keywords.forEach(item => this.constructor._removeUnmappedProperties(item, indexMappingKeywords));
		recommendations.forEach(item => this.constructor._removeUnmappedProperties(item, indexMappingMovies));
		reviews.forEach(item => this.constructor._removeUnmappedProperties(item, indexMappingReviews));
		similar.forEach(item => this.constructor._removeUnmappedProperties(item, indexMappingMovies));
		videos.forEach(item => this.constructor._removeUnmappedProperties(item, indexMappingVideos));
		this.constructor._removeUnmappedProperties(movie, indexMappingMoviesDetails);

		Object.assign(this, movie, {
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

		return this;
	}

	/**
	 * Fetches the full list of results from a paginated result set
	 *
	 * @param {String} endpoint
	 * @param {Number} [page=1]
	 * @returns {Promise<Object[]>}
	 * @private
	 * @async
	 */
	static async _fetchPaginatedResults(endpoint, page = 1) {
		const paginatedResponse = await tmdbClient.request(endpoint, { page });
		const results = paginatedResponse.getResponse();
		let items;

		while (items = await paginatedResponse.getNextResponse()) {
			Array.prototype.push.apply(results, items);
		}

		return results;
	}

	/**
	 * Fetches TheMovieDb configuration object and caches an image size object
	 *
	 * @returns {Promise<{still: [], backdrop: [], profile: [], logo: [], poster: []}>}
	 * @private
	 */
	static async _fetchImageSizes() {
		if (!this._imageSizes) {
			const response = await tmdbClient.request('configuration');
			const { images } = response.getResponse();
			this._imageSizes = {
				backdrop: [],
				logo: [],
				poster: [],
				profile: [],
				still: []
			};
			const {
				backdrop_sizes = [],
				logo_sizes = [],
				poster_sizes = [],
				profile_sizes = [],
				still_sizes = [],
				base_url = ''
			} = images;
			backdrop_sizes.forEach(size => this._imageSizes.backdrop.push(`${base_url}${size}`));
			logo_sizes.forEach(size => this._imageSizes.logo.push(`${base_url}${size}`));
			poster_sizes.forEach(size => this._imageSizes.poster.push(`${base_url}${size}`));
			profile_sizes.forEach(size => this._imageSizes.profile.push(`${base_url}${size}`));
			still_sizes.forEach(size => this._imageSizes.still.push(`${base_url}${size}`));
		}

		return this._imageSizes;
	}

	/**
	 * Replaces relative image paths with absolute paths using TheMovieDB configuration object
	 *
	 * @param {Object} item
	 * @returns {Promise<{Object}>}
	 * @private
	 */
	static async _replaceImagePaths(item) {
		const imageSizes = await this._fetchImageSizes();

		if (item.backdrop_path) {
			item.backdrop_path = `${imageSizes.backdrop[0]}${item.backdrop_path}`;
		}
		if (item.belongs_to_collection) {
			if (item.belongs_to_collection.backdrop_path) {
				item.belongs_to_collection.backdrop_path = `${imageSizes.backdrop[0]}${item.belongs_to_collection.backdrop_path}`;
			}
			if (item.belongs_to_collection.poster_path) {
				item.belongs_to_collection.poster_path = `${imageSizes.poster[0]}${item.belongs_to_collection.poster_path}`;
			}
		}
		if (item.credits) {
			if (item.credits.cast) {
				item.credits.cast.map(item => {
					if (item.profile_path) {
						item.profile_path = `${imageSizes.profile[0]}${item.profile_path}`;
					}
					return item;
				});
			}
			if (item.credits.crew) {
				item.credits.crew.map(item => {
					if (item.profile_path) {
						item.profile_path = `${imageSizes.profile[0]}${item.profile_path}`;
					}
					return item;
				});
			}
		}
		if (item.poster_path) {
			item.poster_path = `${imageSizes.poster[1]}${item.poster_path}`;
		}
		if (item.production_companies) {
			item.production_companies.map(item => {
				if (item.logo_path) {
					item.logo_path = `${imageSizes.logo[0]}${item.logo_path}`;
				}
				return item;
			});
		}
		if (item.recommendations) {
			item.recommendations = item.recommendations.map(item => this._replaceImagePaths(item));
		}
		if (item.reviews) {
			item.reviews = item.reviews.map(item => {
				if (item.author_details && item.author_details.avatar_path) {
					item.author_details.avatar_path = `${imageSizes.profile[0]}${item.author_details.avatar_path}`;
				}
				return item;
			});
		}
		if (item.similar) {
			item.similar = item.similar.map(item => this._replaceImagePaths(item));
		}

		return item;
	}

	/**
	 * Removes properties from the given item that have no ES field mapping
	 *
	 * @param {Object} item
	 * @param {Object} mapping
	 * @private
	 */
	static _removeUnmappedProperties(item, mapping) {
		Object.keys(item).forEach(key => {
			if (typeof mapping[key] === 'undefined') {
				delete item[key];
			}
		});
	}
}

Movie._nextPopularResponse = null;
Movie.MAX_POPULAR_MOVIES = 10000;

module.exports = Movie;
