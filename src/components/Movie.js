import React, { useState } from 'react';

import Carousel from './Carousel';

const getMovieModule = () => import(/* webpackChunkName: 'MoviesAPI' */ '../common/moviesAPI');

function Movie(props) {
	const [isLoading, setIsLoading] = useState(false);
	const [movie, setMovie] = useState({});

	if (!isLoading && !movie.id) {
		if (props.location.movie) {
			setMovie(props.location.movie);
		} else {
			setIsLoading(true);
			getMovieModule()
				.then(({ getMovie }) => getMovie(props.match.params.id))
				.then(({ body }) => setMovie(body))
				.catch(e => console.error(e.message))
				.finally(() => setIsLoading(false));
		}
	}

	return (
		<div className="container">
			{isLoading
				? <div className="text-center">
					<div className="spinner-border align-middle me-1" role="status"></div>
					<span className="align-middle">Loading...</span>
				</div>
				: <>
					<img src={movie.backdrop_path} alt={`${movie.title} Poster`} className="img-fluid" />
					<h1>{movie.title}</h1>
					{/*<Carousel list={ movie.similar } title="Similar" />*/}
					{/*<Carousel list={ movie.recommendations } title="Recommendations" />*/}
				</>}
		</div>
	);
}

export default Movie;
