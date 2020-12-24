import React from 'react';

function MovieCarousel({ list = [], title = '', withIndicators = true, withControls = true }) {
	if (!list.length) {
		return;
	}

	const id = `carousel-movie-${title}`;

	return (
		<>
			<h1>{title}</h1>

			<div id={id} className="carousel slide" data-bs-ride="carousel">
				{withIndicators && <ol className="carousel-indicators">
					{list.map((item, index) => (
						<li
							data-bs-target={`#${id}`}
							data-bs-slide-to={index}
							className={index === 0 ? 'active' : ''}
							key={item.id}></li>
					))}
				</ol>}

				<div className="carousel-inner">
					{list.map((item, index) => (
						<div className={`carousel-item ${index === 0 && 'active'}`} key={item.id}>
							<img src={item.backdrop_path} className="d-block w-100" alt={`${item.title} Backdrop`} />
							<div className="carousel-caption d-none d-md-block">
								<h5>{item.title}</h5>
								<p>{item.overview}</p>
							</div>
						</div>
					))}
				</div>

				{withControls && <>
					<a className="carousel-control-prev" href={`#${id}`} role="button" data-bs-slide="prev">
						<span className="carousel-control-prev-icon" aria-hidden="true"></span>
						<span className="visually-hidden">Previous</span>
					</a>
					<a className="carousel-control-next" href={`#${id}`} role="button" data-bs-slide="next">
						<span className="carousel-control-next-icon" aria-hidden="true"></span>
						<span className="visually-hidden">Next</span>
					</a>
				</>}
			</div>
		</>
	);
}

export default MovieCarousel;
