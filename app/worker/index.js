const express = require('express');
const { router: routerBullBoard, setQueues, BullAdapter } = require('bull-board');

const Queue = require('../classes/Queue');

const queueIndexMovies = new Queue(Queue.NAME_INDEX_MOVIES);

/** Set queues to bull board */
setQueues([
	new BullAdapter(queueIndexMovies.initialize(parseInt(process.env.CONCURRENCY || 1)).getQueue())
]);

const app = express();

/** Routing */
app.use('/queue', routerBullBoard); // Queue dashboard

const port = process.env.PORT;

app.listen(port, () => {
	console.log(`Elastic Movies Worker listening at http://localhost:${port}`);
});
