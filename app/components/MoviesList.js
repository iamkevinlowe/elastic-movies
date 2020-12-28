import React, {
	useEffect,
	useRef,
	useState
} from 'react';
import { Link } from 'react-router-dom';

const getMovieModule = () => import(/* webpackChunkName: 'MoviesAPI' */ '../common/moviesAPI');

function MoviesList() {
	const [isLoading, setIsLoading] = useState(false);
	const [checkBoxStates, setCheckBoxStates] = useState({ title: true, keyword: true, actor: true, character: true });
	const [movies, setMovies] = useState([]);
	const [scrollId, setScrollId] = useState(null);
	const [total, setTotal] = useState(0);

	const searchInputEl = useRef(null);
	const moviesContainerEl = useRef(null);

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
					setMovies([...movies, ...body]);
					setScrollId(scroll_id);
					setTotal(total);
				} catch (e) {
					console.error(e.message);
				} finally {
					isRequesting = false;
				}
			}
		};

		element.addEventListener('scroll', scrollHandler);
		return () => element.removeEventListener('scroll', scrollHandler);
	}, [scrollId, movies, total]);

	const onSearchMoviesSubmit = async e => {
		e.preventDefault();
		setIsLoading(true);

		const { getMovies } = await getMovieModule();
		const params = { fields: [] };

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
			const { body, scroll_id, total } = await getMovies(params);
			setMovies(body);
			setScrollId(scroll_id);
			setTotal(total);
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

	return (
		<div
			className="container d-flex flex-column"
			style={{ height: 'calc(100vh - 64px)' }}>
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
						<Link to={{
							pathname: `/movies/${movie.id}`,
							movie }}>
							<div className="card">
								<img
									className="card-img-top"
									src={movie.poster_path || 'https://picsum.photos/304/456'}
									alt={`${movie.title} Poster`} />
								<div className="card-body">
									<h5 className="card-title">{movie.title}</h5>
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
