const ApiResponse = require('./ApiResponse');
const tmdbClient = require('./TheMovieDb');
const Elasticsearch = require('./Elasticsearch');
const MovieReviews = require('./MovieReviews');
const MovieVideos = require('./MovieVideos');

const esClient = new Elasticsearch({ node: process.env.ES_HOST });

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
	runtime: { type: 'integer' },
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
	 * Fetch movie by the given ID
	 *
	 * @param {Object} [options={}]
	 * @returns {Promise<{Object}>}
	 */
	static async fetchById(options = {}) {
		options.index = this.INDEX;
		const response = await esClient.request('get', options);

		return await this._replaceImagePaths(response._source);
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

		try {
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
		} catch (e) {
			console.log('Error fetching popular batched movies', e.message);
			this._nextPopularResponse = null;
			return null;
		}

		this._nextPopularResponse = popularResponse?.hasNextResponse() ? popularResponse : -1;

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
	 * @returns {Promise<{hits: [], total: {value: number}}>}
	 */
	static async fetchSearchResult(options = {}, body = {}) {
		if (!options.scroll_id) {
			options.index = this.INDEX;
		}
		const response = await esClient.request(options.scroll_id ? 'scroll' : 'search', { ...options, body });

		if (response?.hits?.hits?.length) {
			response.hits.hits = await Promise.all(response?.hits?.hits?.map(async item => {
				item._source = await this._replaceImagePaths(item._source);
				return item;
			}));
		}

		return response;
	}

	/**
	 * Fetches additional details for the movie
	 *
	 * @returns {Promise<Movie>}
	 * @async
	 */
	async fetchAdditionalDetails() {
		try {
			const detailsResponse = await tmdbClient.request(`movie/${this.id}`, {append_to_response: 'credits,keywords,recommendations,reviews,similar,videos'});
			const {
				credits: {
					cast = [],
					crew = []
				} = {},
				keywords: {keywords = []} = {},
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
				videos: {results: videos = []} = {},
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
			reviews.forEach(item => this.constructor._removeUnmappedProperties(item, MovieReviews.getIndexMapping().properties));
			similar.forEach(item => this.constructor._removeUnmappedProperties(item, indexMappingMovies));
			videos.forEach(item => this.constructor._removeUnmappedProperties(item, MovieVideos.getIndexMapping().properties));
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
		} catch (error) {
			console.log('Error fetching additional details', error.message);
		}

		return this;
	}

	/**
	 * Returns the ES field mapping for Movies
	 *
	 * @returns {{properties: {original_language: {type: string}, keywords: {properties: {name: {type: string}, id: {type: string}}}, imdb_id: {type: string}, video: {type: string}, title: {type: string}, video_ids: {type: string}, backdrop_path: {type: string}, similar_ids: {type: string}, review_ids: {type: string}, revenue: {type: string}, credits: {properties: {cast: {properties: {cast_id: {type: string}, character: {type: string}, gender: {type: string}, credit_id: {type: string}, known_for_department: {type: string}, original_name: {type: string}, popularity: {type: string}, name: {type: string}, profile_path: {type: string}, id: {type: string}, order: {type: string}}}, crew: {properties: {gender: {type: string}, credit_id: {type: string}, known_for_department: {type: string}, original_name: {type: string}, popularity: {type: string}, name: {type: string}, profile_path: {type: string}, id: {type: string}, department: {type: string}, job: {type: string}}}}}, genres: {properties: {name: {type: string}, id: {type: string}}}, popularity: {type: string}, production_countries: {properties: {iso_3166_1: {type: string}, name: {type: string}}}, id: {type: string}, vote_count: {type: string}, budget: {type: string}, overview: {type: string}, original_title: {type: string}, recommendation_ids: {type: string}, runtime: {type: string}, genre_ids: {type: string}, poster_path: {type: string}, spoken_languages: {properties: {name: {type: string}, iso_639_1: {type: string}, english_name: {type: string}}}, release_date: {ignore_malformed: boolean, type: string}, production_companies: {properties: {logo_path: {type: string}, name: {type: string}, id: {type: string}, origin_country: {type: string}}}, vote_average: {type: string}, belongs_to_collection: {properties: {backdrop_path: {type: string}, name: {type: string}, id: {type: string}, poster_path: {type: string}}}, tagline: {type: string}, homepage: {type: string}, status: {type: string}}}}
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
				recommendation_ids: { type: 'integer' },
				review_ids: { type: 'text' },
				similar_ids: { type: 'integer' },
				video_ids: { type: 'text' }
			}
		};
	}

	/**
	 * Fetches TheMovieDb configuration object and caches an image size object
	 *
	 * @returns {Promise<{still: [], backdrop: [], profile: [], logo: [], poster: []}>}
	 * @private
	 */
	static async _fetchImageSizes() {
		if (!this._imageSizes) {
			try {
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
			} catch (error) {
				console.log('Error fetching image sizes', error.message);
			}
		}

		return this._imageSizes;
	}

	/**
	 * Fetches the full list of results from a paginated result set
	 *
	 * @param {string} endpoint
	 * @param {number} [page=1]
	 * @returns {Promise<Object[]>}
	 * @private
	 * @async
	 */
	static async _fetchPaginatedResults(endpoint, page = 1) {
		const results = [];

		try {
			const paginatedResponse = await tmdbClient.request(endpoint, { page });
			Array.prototype.push.apply(results, paginatedResponse.getResponse());
			let items;

			while (items = await paginatedResponse.getNextResponse()) {
				Array.prototype.push.apply(results, items);
			}
		} catch (error) {
			console.log('Error fetching paginated results', error.message);
		}

		return results;
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
			item.backdrop_path = `${imageSizes?.backdrop?.[0]}${item.backdrop_path}`;
		}
		if (item.belongs_to_collection?.backdrop_path) {
			item.belongs_to_collection.backdrop_path = `${imageSizes?.backdrop?.[0]}${item.belongs_to_collection.backdrop_path}`;
		}
		if (item.belongs_to_collection?.poster_path) {
			item.belongs_to_collection.poster_path = `${imageSizes?.poster?.[0]}${item.belongs_to_collection.poster_path}`;
		}
		if (item.credits?.cast) {
			item.credits.cast.map(item => {
				if (item.profile_path) {
					item.profile_path = `${imageSizes?.profile?.[0]}${item.profile_path}`;
				}
				return item;
			});
		}
		if (item.credits?.crew) {
			item.credits.crew.map(item => {
				if (item.profile_path) {
					item.profile_path = `${imageSizes?.profile?.[0]}${item.profile_path}`;
				}
				return item;
			});
		}
		if (item.poster_path) {
			item.poster_path = `${imageSizes?.poster?.[1]}${item.poster_path}`;
		}
		if (item.production_companies) {
			item.production_companies.map(item => {
				if (item.logo_path) {
					item.logo_path = `${imageSizes?.logo?.[0]}${item.logo_path}`;
				}
				return item;
			});
		}
		if (item.recommendations) {
			item.recommendations = await Promise.all(item.recommendations.map(item => this._replaceImagePaths(item)));
		}
		if (item.reviews) {
			item.reviews = item.reviews.map(item => {
				if (item.author_details?.avatar_path) {
					item.author_details.avatar_path = `${imageSizes?.profile?.[0]}${item.author_details.avatar_path}`;
				}
				return item;
			});
		}
		if (item.similar) {
			item.similar = await Promise.all(item.similar.map(item => this._replaceImagePaths(item)));
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
Movie.INDEX = 'movies';

module.exports = Movie;
