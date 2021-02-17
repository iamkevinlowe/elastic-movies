import React, {
	useEffect,
	useState
} from 'react';

import MovieFilterItem from './MovieFilterItem';

const getMovieModule = () => import(/* webpackChunkName: 'MoviesAPI' */ '../common/moviesAPI');

function MoviesFilter() {
	const [query, setQuery] = useState({});
	const [castGenders, setCastGenders] = useState([]);
	const [castKnownForDepartments, setCastKnownForDepartments] =  useState([]);
	const [crewDepartments, setCrewDepartments] =  useState([]);
	const [crewGenders, setCrewGenders] = useState([]);
	const [crewJobs, setCrewJobs] = useState([]);
	const [genres, setGenres] = useState([]);
	const [keywords, setKeywords] = useState([]);
	const [originalLanguages, setOriginalLanguages] = useState([]);
	const [productionCompanies, setProductionCompanies] = useState([]);
	const [releaseDates, setReleaseDates] = useState([]);
	const [spokenLanguages, setSpokenLanguages] = useState([]);
	const [statuses, setStatuses] = useState([]);

	useEffect(() => {
		getMovieModule()
			.then(({ getMovies }) => getMovies({
				size: 0,
				aggregations: {
					genre: { aggregation: 'terms' },
					keyword: { aggregation: 'terms' },
					originalLanguage: { aggregation: 'terms' },
					releaseDate: { aggregation: 'date_histogram', calendar_interval: 'year' },
					productionCompany: { aggregation: 'terms' },
					spokenLanguage: { aggregation: 'terms' },
					castGender: { aggregation: 'terms' },
					castKnownForDepartment: { aggregation: 'terms' },
					crewDepartment: { aggregation: 'terms' },
					crewGender: { aggregation: 'terms' },
					crewJob: { aggregation: 'terms' },
					status: { aggregation: 'terms' }
				},
				query
			}))
			.then(({ aggregations }) => {
				setCastGenders(aggregations?.castGender?.buckets || []);
				setCastKnownForDepartments(aggregations?.castKnownForDepartment?.buckets || []);
				setCrewDepartments(aggregations?.crewDepartment?.buckets || []);
				setCrewGenders(aggregations?.crewGender?.buckets || []);
				setCrewJobs(aggregations?.crewJob?.buckets || []);
				setGenres(aggregations?.genre?.buckets || []);
				setKeywords(aggregations?.keyword?.buckets || []);
				setOriginalLanguages(aggregations?.originalLanguage?.buckets || []);
				setProductionCompanies(aggregations?.productionCompany?.buckets || []);
				setReleaseDates(aggregations?.releaseDate?.buckets || []);
				setSpokenLanguages(aggregations?.spokenLanguage?.buckets || []);
				setStatuses(aggregations?.status?.buckets || []);
			});
	}, [query]);

	const onFieldKeyClick = (field, value) => {
		if (value.length) {
			query[field] = {
				occur: 'filter',
				query: 'terms',
				value
			};
		} else {
			delete query[field];
		}

		setQuery({...query});
	}

	return (
		<>
			<h5>Movies Filter</h5>
			<MovieFilterItem
				title="Genre"
				field="genre"
				items={genres}
				onFieldKeyClick={onFieldKeyClick} />
			<MovieFilterItem
				title="Original Language"
				field="originalLanguage"
				items={originalLanguages}
				onFieldKeyClick={onFieldKeyClick} />
			<MovieFilterItem
				title="Spoken Language"
				field="spokenLanguage"
				items={spokenLanguages}
				onFieldKeyClick={onFieldKeyClick} />
			<MovieFilterItem
				title="Status"
				field="status"
				items={statuses}
				onFieldKeyClick={onFieldKeyClick} />
			<MovieFilterItem
				title="Production Company"
				field="productionCompany"
				items={productionCompanies}
				onFieldKeyClick={onFieldKeyClick} />
			<MovieFilterItem
				title="Cast Known For Department"
				field="castDepartment"
				items={castKnownForDepartments}
				onFieldKeyClick={onFieldKeyClick} />
			<MovieFilterItem
				title="Cast Gender"
				field="castGender"
				items={castGenders}
				onFieldKeyClick={onFieldKeyClick} />
			<MovieFilterItem
				title="Crew Department"
				field="crewDepartment"
				items={crewDepartments}
				onFieldKeyClick={onFieldKeyClick} />
			<MovieFilterItem
				title="Crew Job"
				field="crewJob"
				items={crewJobs}
				onFieldKeyClick={onFieldKeyClick} />
			<MovieFilterItem
				title="Crew Gender"
				field="crewGender"
				items={crewGenders}
				onFieldKeyClick={onFieldKeyClick} />
			<MovieFilterItem
				title="Keyword"
				field="keyword"
				items={keywords}
				onFieldKeyClick={onFieldKeyClick} />
			<MovieFilterItem
				title="Release Date"
				field="releaseDate"
				items={releaseDates}
				onFieldKeyClick={onFieldKeyClick} />
		</>
	);
}

export default MoviesFilter;
