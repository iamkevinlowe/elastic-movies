export default {
	convertToQueryString(params, prefix = '') {
		let string = '';

		Object.keys(params).forEach(key => {
			string += `${string.length ? '&' : ''}`;

			let prefixedKey;
			if (prefix) {
				prefixedKey = `${prefix}%5B${key}%5D`;
			}

			string += typeof params[key] === 'object'
				? this.convertToQueryString(params[key], prefixedKey || key)
				: `${prefixedKey || key}=${params[key]}`;
		});

		return string;
	}
};
