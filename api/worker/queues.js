const Queue = require('bull');
const path = require('path');

const QUEUE_NAME_MOVIE_INDEXING = 'movie indexing';

const PROCESSOR_MAP = {
	[QUEUE_NAME_MOVIE_INDEXING]: path.join(__dirname, './processors/indexMovieProcessor')
};

const movieIndexQueue = new Queue(QUEUE_NAME_MOVIE_INDEXING, process.env.REDIS_HOST);

const enableProcessing = queue => {
	queue.on('paused', () => console.log('Movie Index Queue has paused'));
	queue.on('resumed', () => console.log('Movie Index Queue has resumed'));
	queue.process(20, PROCESSOR_MAP[queue.name]);
	queue.resume();
};

module.exports = {
	movieIndexQueue,
	enableProcessing
};
