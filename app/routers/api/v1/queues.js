const express = require('express');
const router = express.Router();

const Queue = require('../../../classes/Queue');

router.put('/:name/resume', async (req, res) => {
	const { name } = req.params;

	if (!name) {
		res.status(500)
			.json({ message: 'Missing required parameters: [name]' });
		return;
	}

	try {
		const queue = (new Queue(name)).getQueue();
		await queue.resume();
		res.json({ ok: true });
	} catch (e) {
		res.status(500)
			.json({ message: e.message });
	}
});

router.put('/:name/pause', async (req, res) => {
	const { name } = req.params;

	if (!name) {
		res.status(500)
			.json({ message: 'Missing required parameters: [name]' });
		return;
	}

	try {
		const queue = (new Queue(name)).getQueue();
		await queue.pause();
		res.json({ ok: true });
	} catch (e) {
		res.status(500)
			.json({ message: e.message });
	}
});

module.exports = router;
