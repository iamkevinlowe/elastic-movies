import React, {
	useEffect,
	useRef,
	useState
} from 'react';
import { Link } from 'react-router-dom';

const getMovieModule = () => import(/* webpackChunkName: 'MoviesAPI' */ '../common/moviesAPI');

function MoviesList() {
	const [isLoading, setIsLoading] = useState(false);
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
		const params = {};
		if (searchInputEl.current.value) {
			params.query = searchInputEl.current.value;
		}

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

	return (
		<div
			className="container d-flex flex-column"
			style={{ height: 'calc(100vh - 64px)' }}>
			<div className="row mb-2">
				<div className="col">
					<form onSubmit={onSearchMoviesSubmit}>
						<div className="input-group">
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
