const Bull = require('bull');
const path = require('path');

const QUEUE_NAME_INDEX_MOVIES = 'movie indexing';

const QUEUES = {
	[QUEUE_NAME_INDEX_MOVIES]: {
		queue: new Bull(QUEUE_NAME_INDEX_MOVIES, process.env.REDIS_HOST),
		processor: path.resolve(__dirname, '..', 'worker', 'processors', 'indexMovieProcessor'),
		isInitialized: false
	}
};

class Queue {
	/**
	 * Creates an instance of Queue
	 *
	 * @param {string} name
	 * @throws
	 */
	constructor(name) {
		this.constructor._validateName(name);
		this.name = name;
		this._config = QUEUES[name];
	}

	/**
	 * Sets paused/resumed listeners for logging and attaches processor
	 *
	 * @param {number} [concurrency=1]
	 * @returns {Queue}
	 */
	initialize(concurrency = 1) {
		if (!this._config.isInitialized) {
			const { queue, processor } = this._config;
			queue.on('paused', () => console.log(`Queue [${this.name}] has paused`));
			queue.on('resumed', () => console.log(`Queue [${this.name}] has resumed`));
			queue.process(concurrency, processor);
			this._config.isInitialized = true;
		}
		return this;
	}

	/** Returns the Bull queue
	 *
	 * @returns {Bull}
	 */
	getQueue() {
		return this._config.queue;
	}

	/**
	 * Validates the given queue name
	 *
	 * @param {string} name
	 * @private
	 * @throws
	 */
	static _validateName(name) {
		if (typeof QUEUES[name] === 'undefined') {
			throw new Error(`No queue found for name [${name}]`);
		}
	}
}

Queue.NAME_INDEX_MOVIES = QUEUE_NAME_INDEX_MOVIES;

module.exports = Queue;
