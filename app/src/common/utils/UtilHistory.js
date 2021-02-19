/**
 * Gets properties stored in the history state object
 *
 * @param {string|string[]} props
 * @returns {*}
 */
export const getHistoryState = props => {
	const { state = {} } = window.history?.state || {};

	if (!Array.isArray(props)) {
		props = [props];
	}

	return props.reduce((memo, prop) => {
		memo[prop] = state?.[prop];
		return memo;
	}, {});
};

/**
 * Sets properties into the history state object
 *
 * @param {object} props
 * @param {string} [title='']
 */
export const setHistoryState = (props, title = '') => {
	window.history.replaceState({
		key: window.history?.state?.key,
		state: {
			...(window.history?.state?.state || {}),
			...props
		}
	}, title);
};
