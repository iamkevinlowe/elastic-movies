const Queue = require('bull');
const path = require('path');

const QUEUE_NAME_MOVIE_INDEXING = 'movie indexing';

const PROCESSOR_MAP = {
	[QUEUE_NAME_MOVIE_INDEXING]: path.join(__dirname, './processors/indexMovieProcessor')
};

const redisQueueConfig = {
	redis: { port: 6379, host: 'redis' }
};

const movieIndexQueue = new Queue(QUEUE_NAME_MOVIE_INDEXING, redisQueueConfig);

const enableProcessing = queue => {
	queue.on('paused', () => console.log('Movie Index Queue has paused'));
	queue.on('resumed', () => console.log('Movie Index Queue has resumed'));
	queue.process(20, PROCESSOR_MAP[queue.name]);
	queue.resume();
}

module.exports = {
	movieIndexQueue,
	enableProcessing
};
