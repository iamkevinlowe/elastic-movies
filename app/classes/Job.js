const indexPopularMovies = require('../worker/jobs/indexPopularMovies');

const JOB_NAME_INDEX_POPULAR_MOVIES = 'index_popular_movies';

const JOB_MAP = {
	[JOB_NAME_INDEX_POPULAR_MOVIES]: indexPopularMovies
};

class Job {
	/**
	 * Creates an instance of Job
	 *
	 * @param {string} name
	 */
	constructor(name) {
		this.constructor._validateName(name);
		this.name = name;
	}

	/**
	 * Executes the job
	 *
	 * @returns {Promise<*>}
	 */
	async run() {
		return JOB_MAP[this.name]();
	}

	/**
	 * Validates the given job name
	 *
	 * @param {string} name
	 * @private
	 * @throws
	 */
	static _validateName(name) {
		if (typeof JOB_MAP[name] === 'undefined') {
			throw new Error(`No job found for name [${name}]`);
		}
	}
}

Job.NAME_INDEX_POPULAR_MOVIES = JOB_NAME_INDEX_POPULAR_MOVIES;

module.exports = Job;
