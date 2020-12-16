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
		const { body } = await getMovies({ query: searchTerm });

		setIsLoading(false);
		setMovies(body);
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

			{movies.map(movie => (
				<div className="mb-2">
					<img src={movie.poster_path} alt="Poster" className="img-thumbnail"/>
					{movie.title}
				</div>
			))}
		</div>
	);
}

export default MoviesList;
