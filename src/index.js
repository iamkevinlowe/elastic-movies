import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { useState } from 'react';
import { render } from 'react-dom';

const getMovieModule = () => import(/* webpackChunkName: 'MoviesAPI' */ './common/moviesAPI');

function App() {
	const [isLoading, setIsLoading] = useState(false);
	const [movies, setMovies] = useState([]);

	const onGetMoviesClick = () => {
		setIsLoading(true);
		getMovieModule()
			.then(({ getMovies }) => {
				getMovies().then(({ body }) => {
					setIsLoading(false);
					setMovies(body);
				});
			});
	};

	return (
		<div>
			{isLoading
				? 'Loading...'
				: (
					<>
						<button onClick={onGetMoviesClick}>Load!</button>
						{movies.map(movie => (
							<div>{movie.title}</div>
						))}
					</>
				)
			}
		</div>
	);
}

render(<App />, document.getElementById('root'));
