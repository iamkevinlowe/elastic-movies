import React, {
	useEffect,
	useRef,
	useState
} from 'react';

import MoviesSearch from './MoviesSearch';
import MoviesFilter from './MoviesFilter';
import MoviesList from './MoviesList';

import { getHistoryState, setHistoryState } from '../common/utils/UtilHistory';

const getMovieModule = () => import(/* webpackChunkName: 'MoviesAPI' */ '../common/moviesAPI');

const styles = {
	container: { height: 'calc(100vh - 64px)' }
};

const aggregations = {
	genre: { aggregation: 'terms' },
	originalLanguage: { aggregation: 'terms' },
	spokenLanguage: { aggregation: 'terms' },
	status: { aggregation: 'terms' },
	productionCompany: { aggregation: 'terms' },
	castDepartment: { aggregation: 'terms' },
	castGender: { aggregation: 'terms' },
	crewDepartment: { aggregation: 'terms' },
	crewJob: { aggregation: 'terms' },
	crewGender: { aggregation: 'terms' },
	keyword: { aggregation: 'terms' },
	releaseDate: { aggregation: 'date_histogram', calendar_interval: 'year' }
};

function Movies({ history }) {
	const {
		aggregations: stateAggregations = {},
		movies: stateMovies = [],
		scrollId: stateScrollId = null,
		total: stateTotal = 0
	} = getHistoryState(['aggregations', 'movies', 'scrollId', 'total']);

	const skipFetch = useRef(null);

	const [isLoading, setIsLoading] = useState(false);
	const [searches, setSearches] = useState([]);
	const [filters, setFilters] = useState([]);
	const [filterAggregations, setFilterAggregations] = useState(stateAggregations);
	const [movies, setMovies] = useState(stateMovies);
	const [scrollId, setScrollId] = useState(stateScrollId);
	const [total, setTotal] = useState(stateTotal);

	if (
		stateMovies.length
		&& skipFetch.current === null
	) {
		skipFetch.current = history.action === 'POP';
	}

	useEffect(() => {
		if (skipFetch.current) {
			skipFetch.current = false;
			return;
		}

		const params = {
			scroll: '1m',
			aggregations,
			query: [...searches, ...filters]
		};

		fetchMovies(params)
			.then(response => {
				setHistoryState({ params }, 'Movies');
				setHistoryAndStates(response);
			});
	}, [searches, filters]);

	const fetchMovies = async params => {
		setIsLoading(true);

		try {
			const { getMovies } = await getMovieModule();
			const response = await getMovies(params) || {};
			let { aggregations = {} } = response;
			const { movies, scroll_id: scrollId, total } = response;

			aggregations = Object.keys(aggregations)
				.reduce((memo, key) => {
					memo[key] = aggregations[key]?.buckets || [];
					return memo;
				}, {});

			return {
				aggregations,
				movies,
				scrollId,
				total
			};
		} catch (error) {
			console.error(error.message);
			return {
				aggregations: {},
				movies: [],
				scrollId: null,
				total: 0
			};
		} finally {
			setIsLoading(false);
		}
	};

	const setHistoryAndStates = ({ aggregations, movies = [], scrollId = null, total = 0 }) => {
		const state = { movies, scrollId, total };

		if (aggregations) {
			state.aggregations = aggregations;
			setFilterAggregations(aggregations);
		}

		setHistoryState(state, 'Movies');

		setMovies(movies);
		setScrollId(scrollId);
		setTotal(total);
	};

	const fetchNextPage = async () => {
		let { movies: newMovies = [], scrollId: newScrollId, total: newTotal } = await fetchMovies({
			scroll: '1m',
			scroll_id: scrollId
		});

		if (newMovies.length) {
			newMovies = [...movies, ...newMovies];
		} else if (
			typeof newScrollId === 'undefined'
			&& typeof newTotal === 'undefined'
		) {
			const { params } = getHistoryState('params');
			params.size = movies.length + 10;
			({ movies: newMovies = [], scrollId: newScrollId, total: newTotal } = await fetchMovies(params));
		}

		setHistoryAndStates({
			movies: newMovies,
			scrollId: newScrollId,
			total: newTotal
		});
	};

	return (
		<div
			className="container-fluid"
			style={styles.container}>
			<div className="row h-100">
				<div className="col-md-3 h-100 d-flex flex-column">
					<div className="row mb-2">
						<div className="col">
							<MoviesSearch
								setSearches={setSearches}
								isLoading={isLoading} />
						</div>
					</div>
					<div className="row overflow-auto">
						<div className="col">
							<MoviesFilter
								setFilters={setFilters}
								aggregations={filterAggregations} />
						</div>
					</div>
				</div>
				<div className="col-md-9 h-100">
					<MoviesList
						movies={movies}
						scrollId={scrollId}
						total={total}
						fetchNextPage={fetchNextPage} />
				</div>
			</div>
		</div>
	);
}

export default Movies;
