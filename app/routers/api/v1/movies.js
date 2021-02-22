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
	const options = { scroll: req?.query?.scroll };
	const body = {};

	if (req.query.scroll_id) {
		options.scroll_id = req.query.scroll_id;
	} else {
		options._source_includes = sourceFields;
		options.sort = req?.query?.sort || 'popularity:desc';

		body.from = req?.query?.from;
		body.size = req?.query?.size;

		Object.assign(
			body,
			buildQuery(req?.query?.query),
			buildAggregations(req?.query?.aggregations)
		);
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

const buildQuery = (params = []) => {
	const bool = {
		filter: [],
		should: []
	};

	params.forEach(({ occur, query, value, field }) => {
		if (
			typeof occur === 'undefined'
			|| typeof query === 'undefined'
			|| typeof value === 'undefined'
			|| typeof field === 'undefined'
			|| typeof bool[occur] === 'undefined'
		) {
			return;
		}

		if (
			field === 'castGender'
			|| field === 'crewGender'
		) {
			value = Array.isArray(value)
				? value.map(value => parseInt(value, 10))
				: parseInt(value, 10);
		}

		field = convertFieldToESMapping(field);

		bool[occur].push({
			[query]: { [field]: value }
		});
	});

	const isEmpty = Object.keys(bool)
		.every(occur => {
			if (!bool[occur].length) {
				delete bool[occur];
				return true;
			}
			return false;
		});

	return isEmpty
		? {}
		: {
			query: { bool }
		};
};

const buildAggregations = (aggregations = {}) => {
	const aggs = {};

	Object.keys(aggregations).forEach(name => {
		const field = convertFieldToESMapping(aggregations[name]?.field || name);
		const aggregation = aggregations[name]?.aggregation || 'terms';

		const aggregationParams = {
			field,
			calendar_interval: aggregations[name]?.calendar_interval
		};

		aggs[name] = { [aggregation]: aggregationParams };
		if (typeof aggregations[name].aggregations !== 'undefined') {
			Object.assign(aggs[name], buildAggregations(aggregations[name].aggregations));
		}
	});

	return Object.keys(aggs).length
		? { aggs }
		: {};
}

const convertFieldToESMapping = field => {
	switch (field) {
		case 'character':
			return 'credits.cast.character';
		case 'castGender':
			return 'credits.cast.gender';
		case 'castDepartment':
			return 'credits.cast.known_for_department';
		case 'castName':
			return 'credits.cast.name';
		case 'crewDepartment':
			return 'credits.crew.department';
		case 'crewGender':
			return 'credits.crew.gender';
		case 'crewJob':
			return 'credits.crew.job';
		case 'genre':
			return 'genres.name';
		case 'keyword':
			return 'keywords.name';
		case 'originalLanguage':
			return 'original_language';
		case 'productionCompany':
			return 'production_companies.name';
		case 'releaseDate':
			return 'release_date';
		case 'spokenLanguage':
			return 'spoken_languages.name';
		case 'popularity':
		case 'budget':
		case 'revenue':
		case 'runtime':
		case 'status':
		case 'title':
			return field;
		default:
			return null;
	}
}

module.exports = router;
