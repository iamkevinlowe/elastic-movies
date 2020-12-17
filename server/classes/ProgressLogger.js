class ProgressLogger {
	/**
	 * Creates an instance of ProgressLogger
	 *
	 * @param {Number} total
	 */
	constructor(total) {
		this._total = total;
		this._processed = 0;
		this._startTime = +new Date();
	}

	/**
	 * Sets processed
	 *
	 * @param {Number} processed
	 */
	setProcessed(processed) {
		this._processed = processed;
	}

	/**
	 * Returns the percentage complete
	 *
	 * @param {Number} [fractionDigits=2]
	 * @returns {string}
	 */
	getPercentComplete(fractionDigits = 2) {
		return (this._processed * 100 / this._total).toFixed(fractionDigits);
	}

	/**
	 * Returns a visual progress bar
	 *
	 * @param {Number} [progressChars=50]
	 * @returns {string}
	 */
	getProgressBar(progressChars = 50) {
		const percentComplete = parseFloat(this.getPercentComplete()) / 100;
		let progressBar = '';

		for (let i = 0; i < progressChars; i++) {
			progressBar += (i / progressChars) < percentComplete ? '\u2588' : '\u2591';
		}

		return progressBar;
	}

	/**
	 * Returns the estimated remaining time
	 *
	 * @returns {string}
	 */
	getEta() {
		if (!this._processed) {
			return 'N/A';
		}

		const eta = [];
		const perProcessedMs = (+new Date() - this._startTime) / this._processed;
		const remainingMs = (this._total - this._processed) * perProcessedMs;

		const days = Math.floor(remainingMs / this.constructor.DAY_MS);
		if (days) {
			eta.push(`${days}d`);
		}

		const hours = Math.floor((remainingMs % this.constructor.DAY_MS) / this.constructor.HOUR_MS);
		if (hours) {
			eta.push(`${hours}h`);
		}

		const minutes = Math.floor((remainingMs % this.constructor.HOUR_MS) / this.constructor.MINUTE_MS);
		if (minutes) {
			eta.push(`${minutes}m`);
		}

		const seconds = Math.floor((remainingMs % this.constructor.MINUTE_MS) / this.constructor.SECOND_MS);
		if (seconds) {
			eta.push(`${seconds}s`);
		}

		return eta.length ? eta.join(' ') : '0s';
	}
}

ProgressLogger.SECOND_MS = 1000;
ProgressLogger.MINUTE_MS = 60 * ProgressLogger.SECOND_MS;
ProgressLogger.HOUR_MS = 60 * ProgressLogger.MINUTE_MS;
ProgressLogger.DAY_MS = 24 * ProgressLogger.HOUR_MS;

module.exports = ProgressLogger;
