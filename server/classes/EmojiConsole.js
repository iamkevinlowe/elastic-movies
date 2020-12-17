class EmojiConsole {
	error(...args) {
		console.log('❌  - ', ...args);
	}

	success(...args) {
		console.log('✅  - ', ...args);
	}

	info(...args) {
		console.log('ℹ️ - ', ...args);
	}

	warn(...args) {
		console.log('⚠️ - ', ...args);
	}
}

Object.keys(console).forEach(key => {
	if (typeof EmojiConsole.prototype[key] === 'undefined') {
		EmojiConsole.prototype[key] = console[key];
	}
});

module.exports = new EmojiConsole();
