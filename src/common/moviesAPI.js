const ENDPOINT = 'http://localhost:3000/api/v1/movies/';

export async function getMovies() {
	const response = await fetch(ENDPOINT);
	if (!response.ok) {
		throw new Error(response.statusText || 'Failed to fetch movies');
	}

	return response.json();
}
