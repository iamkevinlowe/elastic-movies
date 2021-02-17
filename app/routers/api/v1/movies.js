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

		body.size = req?.query?.size;
		body.aggs = buildAggregations(req?.query?.aggregations);
		Object.assign(body, buildQuery(req?.query?.query));
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

const buildQuery = (params = {}) => {
	const bool = {
		filter: [],
		should: []
	};

	Object.keys(params).forEach(key => {
		const { occur, query } = params[key];
		let { value } = params[key];
		let field;

		switch (key) {
			case 'character':
				field = 'credits.cast.character';
				break;
			case 'castGender':
				field = 'credits.cast.gender';
				value = Array.isArray(value)
					? value.map(value => parseInt(value, 10))
					: parseInt(value, 10);
				break;
			case 'castDepartment':
				field = 'credits.cast.known_for_department';
				break;
			case 'castName':
				field = 'credits.cast.name';
				break;
			case 'crewDepartments':
				field = 'credits.crew.department';
				break;
			case 'crewGender':
				field = 'credits.crew.gender';
				value = Array.isArray(value)
					? value.map(value => parseInt(value, 10))
					: parseInt(value, 10);
				break;
			case 'crewJob':
				field = 'credits.crew.job';
				break;
			case 'genre':
				field = 'genres.name';
				break;
			case 'keyword':
				field = 'keywords.name';
				break;
			case 'originalLanguage':
				field = 'original_language';
				break;
			case 'productionCompany':
				field = 'production_companies.name';
				break;
			case 'releaseDate':
				field = 'release_date';
				break;
			case 'spokenLanguage':
				field = 'spoken_languages.name';
				break;
			case 'status':
			default:
				field = key;
				break;
		}

		if (!bool[occur]) {
			return;
		}

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
				field = 'production_companies.name';
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

		const aggregationParams = {
			field,
			calendar_interval: aggregations[name]?.calendar_interval
		};

		if (
			aggregation !== 'avg'
			&& aggregation !== 'min'
			&& aggregation !== 'max'
		) {
			aggregationParams.min_doc_count = 0;
		}

		response[name] = { [aggregation]: aggregationParams };
		if (typeof aggregations[name].aggregations !== 'undefined') {
			response[name].aggs = buildAggregations(aggregations[name].aggregations);
		}
	});

	return response;
}

module.exports = router;
