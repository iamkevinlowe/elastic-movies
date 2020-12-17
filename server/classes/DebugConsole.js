const console = require('./EmojiConsole');

class DebugConsole {
	/**
	 * Creates an instance of DebugConsole
	 */
	constructor() {
		this._logs = {};
		this._order = [];
		this._logsLimit = 5;
		this._loggingInterval = null;
	}

	/**
	 * Adds group name for logging
	 *
	 * @param {String} name
	 * @param {Number|null} [order=null]
	 */
	addLogging(name, order = null) {
		if (typeof this._logs[name] === 'undefined') {
			this._logs[name] = [];
		}

		if (this._order.indexOf(name) !== -1) {
			this._order.splice(this._order.indexOf(name), 1);
		}

		if (order === null) {
			this._order.push(name);
		} else {
			this._order.splice(order, 0, name);
		}
	}

	/**
	 * Queues a log message for the given group name
	 *
	 * @param {String} name
	 * @param {*} args
	 */
	addLog(name, ...args) {
		if (typeof this._logs[name] === 'undefined') {
			this.addLogging(name);
		}

		const log = this._logs[name];

		log.push([`[${name}]`, ...args]);
		log.splice(0, log.length - this._logsLimit);
	}

	/**
	 * Clears the queued logs messages for the given group name
	 *
	 * @param {String} name
	 */
	clearLog(name) {
		if (typeof this._logs[name] !== 'undefined') {
			this._logs[name] = [];
		}
	}

	/**
	 * Begin outputting logs
	 */
	startLogging() {
		if (this._loggingInterval) {
			return;
		}

		this._loggingInterval = setInterval(() => {
			console.clear();
			for (let i = this._order.length - 1; i >= 0; i--) {
				this._logs[this._order[i]].forEach(messages => console.info.apply(console, messages));
			}
		}, 1000);
	}
}

const debugConsole = new DebugConsole();

if (process.env.DEBUG) {
	debugConsole.startLogging();
}

module.exports = debugConsole;
