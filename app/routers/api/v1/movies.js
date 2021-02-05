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
	const options = {};
	const body = {};

	if (req.query.scroll_id) {
		options.scroll_id = req.query.scroll_id;
	} else {
		options._source_includes = sourceFields;

		if (typeof req.query.scroll !== 'undefined') {
			options.scroll = req.query.scroll;
		}

		if (typeof req.query.size !== 'undefined') {
			body.size = req.query.size;
		}

		if (typeof req.query.query !== 'undefined') {
			const query = req.query.query;
			const shouldMatches = req.query.fields
				.map(field => {
					let key;
					switch (field) {
						case 'keyword':
							key = 'keywords.name';
							break;
						case 'actor':
							key = 'credits.cast.name';
							break;
						case 'character':
							key = 'credits.cast.character';
							break;
						default:
							key = field;
					}
					return { match: { [key]: query } };
				});

			body.query = {
				bool: { should: shouldMatches }
			};
		} else {
			options.sort = 'popularity:desc';
		}

		if (typeof req.query.aggregations !== 'undefined') {
			body.aggs = buildAggregations(req.query.aggregations);
		}
	}

	try {
		const fetchResponse = await Movie.fetchSearchResult(options, body);
		const response = {
			aggregations: fetchResponse?.aggregations,
			movies: fetchResponse?.hits?.hits?.map(item => item._source),
			scroll_id: fetchResponse?._scroll_id,
			total: fetchResponse?.hits?.total?.value
		};

		res.json(response);
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

const buildAggregations = aggregations => {
	const response = {};

	Object.keys(aggregations).forEach(name => {
		let field = aggregations[name]?.field || name;
		const aggregation = aggregations[name]?.aggregation || 'terms';

		switch (field) {
			case 'originalLanguage':
				field = 'original_language';
				break;
			case 'releaseDate':
				field = 'release_date';
				break;
			case 'productionCompany':
				field = 'production_companies.name'
				break;
			case 'spokenLanguage':
				field = 'spoken_languages.name';
				break;
			case 'genre':
				field = 'genres.name';
				break;
			case 'keyword':
				field = 'keywords.name';
				break;
			case 'castGender':
				field = 'credits.cast.gender';
				break
			case 'castKnownForDepartment':
				field = 'credits.cast.known_for_department';
				break;
			case 'crewDepartment':
				field = 'credits.crew.department';
				break;
			case 'crewGender':
				field = 'credits.crew.gender';
				break;
			case 'crewJob':
				field = 'credits.crew.job';
				break;
			case 'popularity':
			case 'budget':
			case 'revenue':
			case 'runtime':
			case 'status':
				break;
			default:
				return;
		}

		response[name] = { [aggregation]: { field } };
		if (typeof aggregations[name].aggregations !== 'undefined') {
			response[name].aggs = buildAggregations(aggregations[name].aggregations);
		}
	});

	return response;
}

module.exports = router;
