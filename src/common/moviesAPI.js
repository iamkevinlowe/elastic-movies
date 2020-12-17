const ENDPOINT = 'http://localhost:3000/api/v1/movies/';

export async function getMovies(params = {}) {
	const url = new URL(ENDPOINT);
	url.search = new URLSearchParams(params).toString();

	const controller = new AbortController();
	setTimeout(() => controller.abort(), 5000);

	const response = await fetch(url, { signal: controller.signal });
	if (!response.ok) {
		throw new Error(response.statusText || 'Failed to fetch movies');
	}

	return response.json();
}
