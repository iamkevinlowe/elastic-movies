const Queue = require('bull');
const path = require('path');

const QUEUE_NAME_MOVIE_INDEXING = 'movie indexing';

const QUEUES = {
	[QUEUE_NAME_MOVIE_INDEXING]: {
		queue: new Queue(QUEUE_NAME_MOVIE_INDEXING, process.env.REDIS_HOST),
		processor: path.join(__dirname, './processors/indexMovieProcessor')
	}
};

/**
 * Get queue by name
 *
 * @param {string} name
 * @returns {Queue}
 * @throws Error
 */
const getQueue = name => {
	_validateQueueName(name);
	return QUEUES[name].queue;
}

/**
 * Sets pause/resume listeners for logging and attaches processor
 *
 * @param {string} name
 * @param {number} [concurrency=5]
 * @throws Error
 */
const initProcessing = (name, concurrency = 5) => {
	_validateQueueName(name);
	const { queue, processor } = QUEUES[name];
	queue.on('paused', () => console.log('Movie Index Queue has paused'));
	queue.on('resumed', () => console.log('Movie Index Queue has resumed'));
	queue.process(concurrency, processor);
};

/**
 * Pause or resume a queue
 *
 * @param {string} name
 * @param {boolean} toEnable
 */
const enableProcessing = (name, toEnable) => {
	const queue = getQueue(name);
	if (toEnable) {
		queue.resume();
	} else {
		queue.pause();
	}
};

/**
 * Validates the queue name
 *
 * @param {string} name
 * @throws Error
 * @private
 */
const _validateQueueName = name => {
	if (typeof QUEUES[name] === 'undefined') {
		throw new Error(`Queue [${name} not found`);
	}
}

module.exports = {
	QUEUE_NAME_MOVIE_INDEXING,
	getQueue,
	initProcessing,
	enableProcessing
};
