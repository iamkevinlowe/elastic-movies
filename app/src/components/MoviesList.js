import React, {
	useEffect,
	useRef
} from 'react';
import { Link } from 'react-router-dom';

import { getHistoryState, setHistoryState } from '../common/utils/UtilHistory';

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

function MoviesList({ movies = [], scrollId = null, total = 0, fetchNextPage = () => null }) {
	const { movieId } = getHistoryState('movieId');

	const moviesContainerEl = useRef(null);

	// Scroll back to clicked movie
	if (movieId) {
		useEffect(() => {
			document.querySelector(`[data-id='${movieId}']`)?.scrollIntoView();
		}, []);
	}

	// Infinite scroll
	useEffect(() => {
		if (
			!scrollId
			|| total <= movies.length
		) {
			return;
		}

		let isRequesting = false;
		const element = moviesContainerEl.current;
		const scrollHandler = async e => {
			const { clientHeight, scrollHeight, scrollTop } = e.currentTarget;
			const thresholdAwayFromEnd = 250;

			if (
				!isRequesting
				&& scrollTop + clientHeight >= scrollHeight - thresholdAwayFromEnd
			) {
				isRequesting = true;
				await fetchNextPage();
				isRequesting = false;
			}
		};

		element.addEventListener('scroll', scrollHandler);
		return () => element.removeEventListener('scroll', scrollHandler);
	}, [movies, scrollId, total]);

	const onMovieClick = e => {
		setHistoryState({ movieId: e.currentTarget.dataset.id }, 'Movies');
	};

	return (
		<div
			className="row h-100 overflow-auto"
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
						<div className="card text-secondary">
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
	);
}

export default MoviesList;
