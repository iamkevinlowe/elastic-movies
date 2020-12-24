const console = require('./EmojiConsole');

class Reporter {
	/**
	 * Creates an instance of Reporter
	 *
	 * @param {String|null} [caller=null]
	 */
	constructor(caller = null) {
		this._caller = caller;
		this._times = {};
		this._timeMs = 0;
		this._errors = [];
	}

	/**
	 * Reports what happened
	 */
	report() {
		const prefix = this._caller ? `[${this._caller}] ` : '';

		if (this._errors.length) {
			console.error(`${prefix} ${this._errors.length} errors encountered!`);
			this._errors.forEach(console.error);
			this._errors = [];
		} else {
			console.success(`${prefix}no errors encountered!`);
		}

		const secondsElapsed = (this._timeMs / 1000).toFixed(2);
		console.info(`${prefix}${secondsElapsed} seconds elapsed.\n`)
		this._timeMs = 0;
	}

	/**
	 * Records the time it took to perform an operation
	 *
	 * @param {String|null} [id=null] If falsy, will begin tracking the time.  If truthy, will end tracking the time for the provided id.
	 * @returns {String|void}
	 */
	time(id = null) {
		if (id) {
			if (typeof this._times[id] === 'undefined') {
				this._errors.push(`No time found for id: ${id}`);
				return;
			}

			this._timeMs += +new Date() - this._times[id];
			delete this._times[id];
		} else {
			do {
				id = Math.floor(Math.random() * 2 ** 24).toString(16).padStart(6, '0');
			} while (typeof this._times[id] !== 'undefined')
			this._times[id] = +new Date();
			return id;
		}
	}

	/**
	 * Adds a new error to the list of errors
	 *
	 * @param {*} error
	 */
	addError(error) {
		this._errors.push(error);
	}
}

module.exports = Reporter;
