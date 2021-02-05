import React, {
	useEffect,
	useRef,
	useState
} from 'react';
import { Link } from 'react-router-dom';

const getMovieModule = () => import(/* webpackChunkName: 'MoviesAPI' */ '../common/moviesAPI');
const getVoteBadgeClassNames = vote => {
	const classNames = ['badge', 'rounded-pill', 'text-white'];

	if (vote <= 3) {
		classNames.push('bg-danger');
	} else if (vote >= 7) {
		classNames.push('bg-success');
	} else {
		classNames.push('bg-warning');
	}

	return classNames.join(' ');
};

const styles = {
	container: { height: 'calc(100vh - 64px)' },
	cardImage: { minHeight: '380px' },
	cardVoteBadge: {
		position: 'absolute',
		top: '10px',
		right: '10px'
	},
	cardReleaseDate: {
		position: 'absolute',
		bottom: 0,
		right: '5px'
	}
};

function MoviesList({ history }) {
	const {
		movies: stateMovies = [],
		scrollId: stateScrollId = null,
		total: stateTotal = 0,
		movieId: stateMovieId
	} = history.location.state || {};

	const [isLoading, setIsLoading] = useState(false);
	const [checkBoxStates, setCheckBoxStates] = useState({ title: true, keyword: true, actor: true, character: true });
	const [movies, setMovies] = useState(stateMovies);
	const [scrollId, setScrollId] = useState(stateScrollId);
	const [total, setTotal] = useState(stateTotal);

	const searchInputEl = useRef(null);
	const moviesContainerEl = useRef(null);

	// Scroll back to clicked movie
	if (stateMovieId) {
		useEffect(() => {
				const movieEl = document.querySelector(`[data-id='${stateMovieId}']`);
				movieEl && movieEl.scrollIntoView();
		}, []);
	}

	// Infinite scroll
	useEffect(() => {
		let isRequesting = false;
		const element = moviesContainerEl.current;
		const scrollHandler = async e => {
			const { clientHeight, scrollHeight, scrollTop } = e.currentTarget;
			const thresholdAwayFromEnd = 250;

			if (
				!isRequesting
				&& scrollId
				&& movies.length < total
				&& scrollTop + clientHeight >= scrollHeight - thresholdAwayFromEnd
			) {
				isRequesting = true;
				const { getMovies } = await getMovieModule();

				try {
					const { body, scroll_id, total } = await getMovies({ scroll_id: scrollId });
					setHistoryAndComponentState({
						movies: [...movies, ...body],
						scrollId: scroll_id,
						total
					});
				} catch (e) {
					setHistoryAndComponentState({ movies, total });
				} finally {
					isRequesting = false;
				}
			}
		};

		element.addEventListener('scroll', scrollHandler);
		return () => element.removeEventListener('scroll', scrollHandler);
	}, [scrollId, movies, total]);

	const setHistoryAndComponentState = ({ movies = [], scrollId = null, total = 0 }) => {
		window.history.replaceState({
			key: window.history.state && window.history.state.key,
			state: { movies, scrollId, total }
		}, 'MoviesList');
		setMovies(movies);
		setScrollId(scrollId);
		setTotal(total);
	};

	const onSearchMoviesSubmit = async e => {
		e.preventDefault();
		setIsLoading(true);

		const { getMovies } = await getMovieModule();
		const params = { scroll: '1m', fields: [] };

		if (searchInputEl.current.value) {
			params.query = searchInputEl.current.value;
		}

		Object.keys(checkBoxStates)
			.forEach(field => {
				if (checkBoxStates[field]) {
					params.fields.push(field);
				}
			});

		try {
			const { movies, scroll_id, total } = await getMovies(params);
			setHistoryAndComponentState({
				movies,
				scrollId: scroll_id,
				total
			});
			moviesContainerEl.current.scrollTo(0, 0);
		} catch (e) {
			console.error(e.message);
		} finally {
			setIsLoading(false);
		}
	};

	const onCheckboxChange = e => {
		const fieldsChecked = Object.values(checkBoxStates)
			.filter(value => value)
			.length;

		if (
			!e.currentTarget.checked
			&& fieldsChecked <= 1) {
			alert('At least 1 field must be selected');
			return false;
		}

		checkBoxStates[e.currentTarget.name] = !checkBoxStates[e.currentTarget.name];
		setCheckBoxStates({ ...checkBoxStates });
	};

	const onMovieClick = e => {
		window.history.replaceState({
			key: window.history.state.key,
			state: { ...window.history.state.state, movieId: e.currentTarget.dataset.id }
		}, 'MoviesList');
	};

	return (
		<div
			className="container d-flex flex-column"
			style={styles.container}>
			<div className="row mb-2">
				<div className="col">
					<form onSubmit={onSearchMoviesSubmit}>
						<div className="input-group mb-2">
							<input
								type="text"
								className="form-control"
								placeholder="Search movies..."
								aria-label="Search movies"
								aria-describedby="button-addon"
								ref={searchInputEl}
								disabled={isLoading} />
							<div className="input-group-append">
								<button
									className="btn btn-outline-secondary"
									type="submit"
									id="button-addon"
									disabled={isLoading}>
									{isLoading
										? (
											<>
												<span
													className="spinner-border spinner-border-sm me-1"
													role="status"
													aria-hidden="true">
												</span>
												Loading...
											</>
										)
										: 'Search'}
								</button>
							</div>
						</div>

						<div className="text-center">
							<div className="form-check form-check-inline form-switch">
								<input
									className="form-check-input"
									id="checkboxTitle"
									type="checkbox"
									name="title"
									checked={checkBoxStates.title}
									onChange={onCheckboxChange} />
								<label
									className="form-check-label"
									htmlFor="checkboxTitle">Title</label>
							</div>
							<div className="form-check form-check-inline form-switch">
									<input
										className="form-check-input"
										id="checkboxKeyword"
										type="checkbox"
										name="keyword"
										checked={checkBoxStates.keyword}
										onChange={onCheckboxChange} />
									<label
										className="form-check-label"
										htmlFor="checkboxKeyword">Keyword</label>
								</div>
							<div className="form-check form-check-inline form-switch">
									<input
										className="form-check-input"
										id="checkboxActor"
										type="checkbox"
										name="actor"
										checked={checkBoxStates.actor}
										onChange={onCheckboxChange} />
									<label
										className="form-check-label"
										htmlFor="checkboxActor">Actor/Actress</label>
								</div>
							<div className="form-check form-check-inline form-switch">
								<input
									className="form-check-input"
									id="checkboxCharacter"
									type="checkbox"
									name="character"
									checked={checkBoxStates.character}
									onChange={onCheckboxChange} />
								<label
									className="form-check-label"
									htmlFor="checkboxCharacter">Character</label>
							</div>
						</div>
					</form>
				</div>
			</div>

			<div
				className="row overflow-auto"
				ref={moviesContainerEl}>
				{movies.map(movie => (
					<div
						className="col-3 mb-2"
						key={movie.id}>
						<Link
							className="text-decoration-none"
							data-id={movie.id}
							onClick={onMovieClick}
							to={{
								pathname: `/movies/${movie.id}`,
								movie
							}}>
							<div className="card text-secondary position-relative">
								<img
									className="card-img-top"
									src={movie.poster_path || 'https://picsum.photos/253/380'}
									alt={`${movie.title} Poster`}
									style={styles.cardImage} />
								<span
									className={getVoteBadgeClassNames(movie.vote_average)}
									style={styles.cardVoteBadge}>
									{movie.vote_average}
								</span>
								<div className="card-body">
									<h5 className="card-title">{movie.title}</h5>
									<small
										className="text-muted"
										style={styles.cardReleaseDate}>
										{(new Date(movie.release_date)).toDateString()}
									</small>
								</div>
							</div>
						</Link>
					</div>
				))}
			</div>
		</div>
	);
}

export default MoviesList;
