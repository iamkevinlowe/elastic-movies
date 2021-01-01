const ENDPOINT = 'http://localhost/api/v1/movies/';

/**
 * Fetches movies by the given params
 *
 * @param {Object} [params={}]
 * @returns {Promise<Object>}
 * @throws Error
 */
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

/**
 * Fetch movie by the given id
 *
 * @param {number} id
 * @returns {Promise<Object>}
 * @throws Error
 */
export async function getMovie(id) {
	if (!id) {
		throw new Error('No id provided');
	}

	const url = new URL(`${ENDPOINT}${id}`);

	const controller = new AbortController();
	setTimeout(() => controller.abort(), 5000);

	const response = await fetch(url, { signal: controller.signal });
	if (!response.ok) {
		throw new Error(response.statusText || 'Failed to fetch movie');
	}

	return response.json();
}
