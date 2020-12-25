const Queue = require('bull');
const path = require('path');

const redisQueueConfig = {
	redis: { port: 6379, host: 'redis' }
};

const movieIndexQueue = new Queue('movie indexing', redisQueueConfig);

movieIndexQueue.process(path.join(__dirname, './processors/movieIndexing'));

module.exports = {
	movieIndexQueue
};
