const express = require('express');
const router = express.Router();
const Movie = require('../../../classes/Movie');

const index = 'movies';

router.get('/', async (req, res) => {
	const options = { index };
	const body = {};

	if (req.query.query) {
		body.query = {
			match: { title: req.query.query }
		};
	}

	const response = await Movie.fetchSearchResult(options, body);
	const movies = response.hits.map(item => item._source);
	res.json({ body: movies, total: response.total.value });
});

router.get('/:id', async (req, res) => {
	const response = await Movie.fetchById({ index, id: req.params.id });
	res.json({ body: response._source });
});

module.exports = router;
