const express = require('express');
const router = express.Router();
const Movie = require('../../../classes/Movie');

router.get('/', async (req, res) => {
	const options = { index: Movie.INDEX };
	const body = {};

	if (req.query.query) {
		body.query = {
			match: { title: req.query.query }
		};
	}

	try {
		const response = await Movie.fetchSearchResult(options, body);
		const movies = response.hits.map(item => filterFields(item._source));
		res.json({ body: movies, total: response.total.value });
	} catch (e) {
		console.error(e.message);
		res.status(500).json(e);
	}
});

router.get('/:id', async (req, res) => {
	try {
		const response = await Movie.fetchById({ index: Movie.INDEX, id: req.params.id });
		res.json({ body: filterFields(response) });
	} catch (e) {
		console.error(e.message);
		res.status(500).json(e);
	}
});

/**
 * Filters out extra fields
 *
 * @param {Object} item
 * @returns {Object}
 */
function filterFields(item) {
	delete item.genre_ids;
	delete item.original_language;
	delete item.original_title;
	delete item.video;
	if (item.belongs_to_collection) {
		if (Array.isArray(item.belongs_to_collection)) {
			item.belongs_to_collection.forEach(belongsToCollection => {
				delete belongsToCollection.backdrop_path;
				delete belongsToCollection.poster_path;
			});
		} else {
			delete item.belongs_to_collection.backdrop_path;
			delete item.belongs_to_collection.poster_path;
		}
	}
	delete item.imdb_id;
	if (item.production_companies) {
		if (Array.isArray(item.production_companies)) {
			item.production_companies.forEach(productionCompany => {
				delete productionCompany.logo_path;
				delete productionCompany.origin_country;
			});
		} else {
			delete item.production_companies.logo_path;
			delete item.production_companies.origin_country;
		}
	}
	delete item.credits;
	delete item.recommendations;
	delete item.reviews;
	delete item.similar;
	delete item.videos;

	return item;
}

module.exports = router;
