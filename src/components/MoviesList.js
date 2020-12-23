import React, { useState } from 'react';

const getMovieModule = () => import(/* webpackChunkName: 'MoviesAPI' */ '../common/moviesAPI');

function MoviesList() {
	const [isLoading, setIsLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [movies, setMovies] = useState([]);

	const onSearchMoviesSubmit = async e => {
		e.preventDefault();
		setIsLoading(true);

		const { getMovies } = await getMovieModule();
		const params = {};
		if (searchTerm) {
			params.query = searchTerm;
		}

		try {
			const { body } = await getMovies(params);
			setMovies(body);
		} catch (e) {
			console.error(e.message);
		} finally {
			setIsLoading(false);
		}
	};

	const onSearchInputChange = e => {
		setSearchTerm(e.currentTarget.value);
	};

	return (
		<div className="container">
			<form onSubmit={onSearchMoviesSubmit}>
				<div className="input-group">
					<input
						type="text"
						className="form-control"
						placeholder="Search movies..."
						aria-label="Search movies"
						aria-describedby="button-addon"
						value={searchTerm}
						onChange={onSearchInputChange}
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

			<div className="row row-cols-4 g-4 mt-1">
				{movies.map(movie => (
					<div className="col" key={movie.id}>
						<div className="card">
							<img src={movie.poster_path} alt={`${movie.title} Poster`} className="card-img-top"/>
							<div className="card-body">
								<h5 className="card-title">{movie.title}</h5>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default MoviesList;
