import React, { useState } from 'react';

import MovieCarousel from './MovieCarousel';

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
					<div className="card mb-4">
						<div className="row g-0">
							<div className="col-sm-3 text-center">
								<img
									className="img-fluid"
									src={movie.poster_path || 'https://picsum.photos/154/231'}
									alt={`${movie.title} Poster`} />
							</div>
							<div className="col-sm-9">
								<div className="card-body">
									<h5 className="card-title">{movie.title}</h5>
									<p className="card-text">{movie.overview}</p>
									<p className="card-text"><small className="text-muted">{movie.release_date}</small></p>
								</div>
							</div>
						</div>
					</div>

					{movie.keywords && movie.keywords.length
						? <dl className="row justify-content-center">
							<dt className="col-2">Keywords</dt>
							<dd className="col-8">
								<ul className="list-inline">
									{movie.keywords.map(item => (
										<li
											className="list-inline-item"
											key={item.id}>
											{item.name}
										</li>
									))}
								</ul>
							</dd>
						</dl>
						: null}
					{typeof movie.popularity !== 'undefined'
						&& <dl className="row justify-content-center">
							<dt className="col-2">Popularity</dt>
							<dd className="col-8">{movie.popularity}</dd>
						</dl>}
					{typeof movie.vote_average !== 'undefined'
						&& <dl className="row justify-content-center">
							<dt className="col-2">Vote Average</dt>
							<dd className="col-8">{movie.vote_average}</dd>
						</dl>}
					{typeof movie.vote_count !== 'undefined'
						&& <dl className="row justify-content-center">
							<dt className="col-2">Vote Count</dt>
							<dd className="col-8">{movie.vote_count}</dd>
						</dl>}
					{typeof movie.belongs_to_collection !== 'undefined'
						&& <dl className="row justify-content-center">
							<dt className="col-2">Belongs to Collection</dt>
							<dd className="col-8">{movie.belongs_to_collection.name}</dd>
						</dl>}
					{typeof movie.budget !== 'undefined'
						&& <dl className="row justify-content-center">
							<dt className="col-2">Budget</dt>
							<dd className="col-8">{movie.budget}</dd>
						</dl>}
					{movie.genres && movie.genres.length
						? <dl className="row justify-content-center">
							<dt className="col-2">Genres</dt>
							<dd className="col-8">
								<ul className="list-inline">
									{movie.genres.map(item => (
										<li
											className="list-inline-item"
											key={item.id}>
											{item.name}
										</li>
									))}
								</ul>
							</dd>
						</dl>
						: null}
					{typeof movie.homepage !== 'undefined'
						&& <dl className="row justify-content-center">
							<dt className="col-2">Homepage</dt>
							<dd className="col-8">{movie.homepage}</dd>
						</dl>}
					{movie.production_companies && movie.production_companies.length
						? <dl className="row justify-content-center">
							<dt className="col-2">Production Companies</dt>
							<dd className="col-8">
								<ul className="list-inline">
									{movie.production_companies.map(item => (
										<li
											className="list-inline-item"
											key={item.id}>
											{item.name}
										</li>
									))}
								</ul>
							</dd>
						</dl>
						: null}
					{movie.production_countries && movie.production_countries.length
						? <dl className="row justify-content-center">
							<dt className="col-2">Production Countries</dt>
							<dd className="col-8">
								<ul className="list-inline">
									{movie.production_countries.map(item => (
										<li
											className="list-inline-item"
											key={item.iso_3166_1}>
											{item.name}
										</li>
									))}
								</ul>
							</dd>
						</dl>
						: null}
					{typeof movie.revenue !== 'undefined'
						&& <dl className="row justify-content-center">
							<dt className="col-2">Revenue</dt>
							<dd className="col-8">{movie.revenue}</dd>
						</dl>}
					{typeof movie.runtime !== 'undefined'
						&& <dl className="row justify-content-center">
							<dt className="col-2">Runtime</dt>
							<dd className="col-8">{movie.runtime}</dd>
						</dl>}
					{movie.spoken_languages && movie.spoken_languages.length
						? <dl className="row justify-content-center">
							<dt className="col-2">Spoken Languages</dt>
							<dd className="col-8">
								<ul className="list-inline">
									{movie.spoken_languages.map(item => (
										<li
											className="list-inline-item"
											key={item.iso_639_1}>
											{item.name}
										</li>
									))}
								</ul>
							</dd>
						</dl>
						: null}
					{typeof movie.status !== 'undefined'
						&& <dl className="row justify-content-center">
							<dt className="col-2">Status</dt>
							<dd className="col-8">{movie.status}</dd>
						</dl>}
					{typeof movie.tagline !== 'undefined'
						&& <dl className="row justify-content-center">
							<dt className="col-2">Tagline</dt>
							<dd className="col-8">{movie.tagline}</dd>
						</dl>}

					{/*<MovieCarousel list={ movie.similar } title="Similar" withIndicators={false} />*/}
					{/*<MovieCarousel list={ movie.recommendations } title="Recommendations" withIndicators={false} />*/}
				</>}
		</div>
	);
}

export default Movie;
