const express = require('express');
const router = express.Router();
const Movie = require('../../../classes/Movie');

const index = 'movies';

router.get('/', async (req, res) => {
	const response = await Movie.fetchSearchResult({ index });
	const movies = response.hits.map(item => item._source);
	res.json({ body: movies });
});

module.exports = router;
