const express = require('express');
const router = express.Router();
const Movie = require('../../../classes/Movie');

const sourceFields = [
	'backdrop_path', 'id', 'overview', 'popularity', 'poster_path', 'release_date', 'title', 'vote_average',
	'vote_count', 'belongs_to_collection.id', 'belongs_to_collection.name', 'budget', 'genres.id', 'genres.name',
	'homepage', 'production_companies.id', 'production_companies.name', 'production_countries.iso_3166_1',
	'production_countries.name', 'revenue', 'runtime', 'spoken_languages', 'status', 'tagline', 'keywords'
];

router.get('/', async (req, res) => {
	const options = { scroll: '1m' };
	const body = {};

	if (req.query.scroll_id) {
		options.scroll_id = req.query.scroll_id;
	} else {
		options._source_includes = sourceFields;

		if (req.query.query) {
			const query = req.query.query;
			body.query = {
				bool: {
					should: [
						{ match: { title: query } },
						{ match: { 'keywords.name': query } },
						{ match: { 'credits.cast.name': query } },
						{ match: { 'credits.cast.character': query } }
					]
				}
			};
		}
	}

	try {
		const response = await Movie.fetchSearchResult(options, body);
		const movies = response.hits.map(item => item._source);
		res.json({ body: movies, total: response.total.value, scroll_id: response.scroll_id });
	} catch (e) {
		console.error(e.message);
		res.status(500).json(e);
	}
});

router.get('/:id', async (req, res) => {
	try {
		const response = await Movie.fetchById({ id: req.params.id, _source_includes: sourceFields });
		res.json({ body: response });
	} catch (e) {
		console.error(e.message);
		res.status(500).json(e);
	}
});

module.exports = router;
