import React, {
	useState
} from 'react';

import MovieFilterItem from './MovieFilterItem';

const aggregationTitleMap = {
	genre: 'Genre',
	originalLanguage: 'Original Language',
	spokenLanguage: 'Spoken Language',
	status: 'Status',
	productionCompany: 'Production Company',
	castDepartment: 'Cast Known For Department',
	castGender: 'Cast Gender',
	crewDepartment: 'Crew Department',
	crewJob: 'Crew Job',
	crewGender: 'Crew Gender',
	keyword: 'Keyword',
	releaseDate: 'Release Date'
};

const sortAggregations = aggregations => {
	return Object.keys(aggregationTitleMap).reduce((memo, key) => {
			memo[key] = aggregations[key] || [];
			return memo;
	}, {});
};

function MoviesFilter({ setFilters = () => null, aggregations = {} }) {
	const [queriesByField, setQueriesByField] = useState({});

	const onFieldKeyClick = (field, values) => {
		if (values.length) {
			queriesByField[field] = values;
		} else {
			delete queriesByField[field];
		}

		const query = Object.values(queriesByField)
			.reduce((memo, queries) => memo.concat(queries), []);

		setFilters(query);

		setQueriesByField({ ...queriesByField });
	};

	return (
		<>
			<h5>Movies Filter</h5>
			{Object.keys(sortAggregations(aggregations)).map(key => (
				<MovieFilterItem
					key={key}
					field={key}
					title={aggregationTitleMap[key]}
					items={aggregations[key]}
					onFieldKeyClick={onFieldKeyClick} />
			))}
		</>
	);
}

export default MoviesFilter;
