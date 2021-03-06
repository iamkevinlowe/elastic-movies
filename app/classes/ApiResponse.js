class ApiResponse {
	/**
	 * Creates an instance of ApiResponse
	 *
	 * @param {*|null} [response=null]
	 */
	constructor(response = null) {
		this._response = response;
		this._nextRequestCallback = null;
	}

	/**
	 * Returns the response
	 *
	 * @returns {*|null}
	 */
	getResponse() {
		return this._response;
	}

	/**
	 * Sets a response
	 *
	 * @param {*|null} [response=null]
	 */
	setResponse(response = null) {
		this._response = response;
	}

	/**
	 * Sets the next request callback for paginated results
	 *
	 * @param {Function} callback
	 */
	setNextRequestCallback(callback) {
		if (typeof callback === 'function') {
			this._nextRequestCallback = callback;
		}
	}

	/**
	 * Returns true if there is a next request callback
	 *
	 * @returns {boolean}
	 */
	hasNextResponse() {
		return !!this._nextRequestCallback;
	}

	/**
	 * Returns the response from the next paginated request
	 *
	 * @async
	 * @returns {Promise<*|null>}
	 */
	async getNextResponse() {
		if (typeof this?._nextRequestCallback === 'function') {
			return new Promise(resolve => {
				const promise = this._nextRequestCallback();
				this._nextRequestCallback = null;
				this._response = null;

				promise.then(response => {
					this._response = response._response;
					this._nextRequestCallback = response._nextRequestCallback;
					resolve(this._response);
				}).catch(error => {
					console.log('Error getting next response', error.message);
				});
			});
		}

		this._nextRequestCallback = null;
	}
}

module.exports = ApiResponse;
