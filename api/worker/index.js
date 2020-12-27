const express = require('express');
const { router, setQueues, BullAdapter } = require('bull-board');

const { movieIndexQueue, enableProcessing } = require('./queues');
const indexPopularMovies = require('./jobs/indexPopularMovies');

const port = 9000;
const app = express();

app.use('/', router);

app.post('/indexPopularMovies', (req, res) => {
	indexPopularMovies()
		.then(() => res.json({ ok: true }))
		.catch(error => res.status(500).json(error));
});

setQueues([
	new BullAdapter(movieIndexQueue)
]);

enableProcessing(movieIndexQueue);

app.listen(port, () => {
	console.log(`Elastic Movies Worker listening at http://localhost:${port}`);
});
