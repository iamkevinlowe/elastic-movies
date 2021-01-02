const express = require('express');
const bodyParser = require('body-parser');
const { router, setQueues, BullAdapter } = require('bull-board');

const {
	QUEUE_NAME_MOVIE_INDEXING,
	getQueue,
	initProcessing,
	enableProcessing
} = require('./queues');
const indexPopularMovies = require('./jobs/indexPopularMovies');

const app = express();

/** Body Parser */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/** Bull Job Queue UI */
app.use('/', router);

app.post('/indexPopularMovies', (req, res) => {
	indexPopularMovies()
		.then(() => res.json({ ok: true }))
		.catch(error => res.status(500).json({ message: error.message }));
});

app.post('/queues', (req, res) => {
	const { name, enable } = req.body;

	if (!name || !enable) {
		res.status(500).json({ message: 'Missing required body parameters: [name, enable]'});
		return;
	}

	try {
		enableProcessing(name, enable === 'true' || !!parseInt(enable));
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

/** Set queues to bull board */
setQueues([
	new BullAdapter(getQueue(QUEUE_NAME_MOVIE_INDEXING))
]);
initProcessing(QUEUE_NAME_MOVIE_INDEXING);

const port = process.env.PORT;

app.listen(port, () => {
	console.log(`Elastic Movies Worker listening at http://localhost:${port}`);
});
