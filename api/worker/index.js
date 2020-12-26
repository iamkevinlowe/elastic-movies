const express = require('express');
const { router, setQueues, BullAdapter } = require('bull-board');

const { movieIndexQueue } = require('./queues');
const indexPopularMovies = require('./jobs/indexPopularMovies');

const port = 9000;
const app = express();

app.use('/', router);

app.post('/indexPopularMovies', (req, res) => {
	indexPopularMovies();
	res.json({ ok: true });
});

setQueues([
	new BullAdapter(movieIndexQueue)
]);

app.listen(port, () => {
	console.log(`Elastic Movies Worker listening at http://localhost:${port}`);
});
