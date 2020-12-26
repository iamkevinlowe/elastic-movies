module.exports = {
	/**
	 * Capitalizes the first character in the given string
	 *
	 * @param {string} string
	 * @returns {string}
	 */
	capitalize: string => `${string.slice(0, 1).toUpperCase()}${string.slice(1)}`
};
