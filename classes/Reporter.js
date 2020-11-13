const console = require('./EmojiConsole');

class Reporter {
	constructor(caller = null) {
		this._caller = caller;
		this._times = {};
		this._timeMs = 0;
		this._errors = [];
	}

	report() {
		const prefix = this._caller ? `${this._caller}: ` : '';

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

	time(id = null) {
		if (id) {
			if (typeof this._times[id] === 'undefined') {
				this.errors.push(`No time found for id: ${id}`);
				return;
			}

			this._timeMs += +new Date() - this._times[id];
			delete this._times[id];
		} else {
			do {
				id = Math.floor(Math.random() * 2 ** 24).toString(16).padStart(6, '0')
			} while (typeof this._times[id] !== 'undefined')
			this._times[id] = +new Date();
			return id;
		}
	}

	addError(error) {
		this._errors.push(error);
	}
}

module.exports = Reporter;
