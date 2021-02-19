import React, {
	useEffect,
	useState
} from 'react';
import Chart from 'chart.js';

import UtilColors from "../common/utils/UtilColors";

const getMovieModule = () => import(/* webpackChunkName: 'MoviesAPI' */ '../common/moviesAPI');
import { getMovies } from '../common/moviesAPI';

function MoviesDashboard() {
	const [genres, setGenres] = useState([]);
	const [selectedGenre, setSelectedGenre] = useState(null);
	const [keywords, setKeywords] = useState([]);

	useEffect(() => {
		getMovieModule()
			.then(({ getMovies }) => getMovies({
				size: 0,
				aggregations: {
					genre: {
						aggregation: 'terms',
						aggregations: {
							keyword: {
								aggregation: 'terms',
								aggregations: {
									avgPopularity: {
										field: 'popularity',
										aggregation: 'avg'
									}
								}
							},
							avgPopularity: {
								field: 'popularity',
								aggregation: 'avg'
							}
						}
					},
					originalLanguage: { aggregation: 'terms' },
					releaseDate: { aggregation: 'terms' },
					productionCompany: { aggregation: 'terms' },
					spokenLanguage: { aggregation: 'terms' },
					castGender: { aggregation: 'terms' },
					castDepartment: { aggregation: 'terms' },
					crewDepartment: { aggregation: 'terms' },
					crewGender: { aggregation: 'terms' },
					crewJob: { aggregation: 'terms' },
					minBudget: { field: 'budget', aggregation: 'min' },
					avgBudget: { field: 'budget', aggregation: 'avg' },
					maxBudget: { field: 'budget', aggregation: 'max' },
					minRevenue: { field: 'revenue', aggregation: 'min' },
					avgRevenue: { field: 'revenue', aggregation: 'avg' },
					maxRevenue: { field: 'revenue', aggregation: 'max' },
					minRuntime: { field: 'runtime', aggregation: 'min' },
					avgRuntime: { field: 'runtime', aggregation: 'avg' },
					maxRuntime: { field: 'runtime', aggregation: 'max' },
					status: { aggregation: 'terms' }
				}
			}))
			.then(({ aggregations }) => setGenres(aggregations?.genre?.buckets || []));
	}, []);

	useEffect(() => {
		if (!genres.length) {
			return;
		}

		const labels = [];
		const popularityDataset = {
			type: 'line',
			label: 'Popularity',
			yAxisID: 'popularityY',
			borderColor: '#39c8c3',
			fill: false,
			data: []
		};
		const genreDataset = {
			type: 'bar',
			yAxisID: 'genreY',
			data: [],
			backgroundColor: []
		};
		const popularityTicks = { min: 0, max: 0 };
		const genreTicks = { min: 0, max: 0 };

		const paletteColors = UtilColors.getChartPalette();
		genres.forEach(({ key, doc_count, avgPopularity }, index) => {
			labels.push(key);

			popularityDataset.data.push(avgPopularity.value);
			popularityTicks.max = Math.max(popularityTicks.max, avgPopularity.value);

			genreDataset.data.push(doc_count);
			genreDataset.backgroundColor.push(paletteColors[index % paletteColors.length]);
			genreTicks.max = Math.max(genreTicks.max, doc_count);
		});

		const chart = new Chart(
			document.getElementById('genres_chart'),
			{
				type: 'bar',
				data: {
					datasets: [
						popularityDataset,
						genreDataset
					],
					labels
				},
				options: {
					title: {
						display: true,
						text: 'Genres'
					},
					legend: {
						labels: {
							filter: item => item.text
						}
					},
					scales: {
						yAxes: [{
							id: 'popularityY',
							display: false,
							ticks: popularityTicks
						}, {
							id: 'genreY',
							display: false,
							ticks: genreTicks
						}]
					},
					onClick: e => {
						const [chartElement] = chart.getElementAtEvent(e);
						if (typeof chartElement?._index !== 'undefined') {
							setSelectedGenre(genres[chartElement._index]?.key || null);
							setKeywords(genres[chartElement._index]?.keyword?.buckets || []);
						}
					}
				}
			}
		);

		return () => chart.destroy();
	}, [genres]);

	useEffect(() => {
		if (!genres || !keywords.length) {
			return;
		}

		const labels = [];
		const popularityDataset = {
			type: 'line',
			label: 'Popularity',
			yAxisID: 'popularityY',
			borderColor: '#39c8c3',
			fill: false,
			data: []
		};
		const keywordsDataset = {
			type: 'bar',
			yAxisID: 'keywordsY',
			data: [],
			backgroundColor: []
		};
		const popularityTicks = { min: 0, max: 0 };
		const keywordsTicks = { min: 0, max: 0 };

		const paletteColors = UtilColors.getChartPalette();
		keywords.forEach(({ key, doc_count, avgPopularity }, index) => {
			labels.push(key);

			popularityDataset.data.push(avgPopularity.value);
			popularityTicks.max = Math.max(popularityTicks.max, avgPopularity.value);

			keywordsDataset.data.push(doc_count);
			keywordsDataset.backgroundColor.push(paletteColors[index % paletteColors.length]);
			keywordsTicks.max = Math.max(keywordsTicks.max, doc_count);
		});

		const chart = new Chart(
			document.getElementById('keywords_chart'),
			{
				type: 'bar',
				data: {
					datasets: [
						popularityDataset,
						keywordsDataset
					],
					labels
				},
				options: {
					title: {
						display: true,
						text: `${selectedGenre} Keywords`
					},
					legend: {
						labels: {
							filter: item => item.text
						}
					},
					scales: {
						yAxes: [{
							id: 'popularityY',
							display: false,
							ticks: popularityTicks
						}, {
							id: 'keywordsY',
							display: false,
							ticks: keywordsTicks
						}]
					}
				}
			}
		);

		return () => chart.destroy();
	}, [selectedGenre, keywords]);

	return (
		<div className="container">
			<div className="row overflow-auto">
				{genres.length
					? <div className="col-lg-6 mb-2">
						<div className="card">
							<div className="card-body">
								<canvas id="genres_chart"/>
							</div>
						</div>
					</div>
					: null}
				{keywords.length
					? <div className="col-lg-6 mb-2">
						<div className="card">
							<div className="card-body">
								<canvas id="keywords_chart"/>
							</div>
						</div>
					</div>
					: null}
			</div>
		</div>
	);
}

export default MoviesDashboard;
