const express = require('express');
const router = express.Router();

const Job = require('../../../classes/Job');

router.post('/:name', async (req, res) => {
	const { name } = req.params;

	if (!name) {
		res.status(500)
			.json({ message: 'Missing required parameters: [name]' });
		return;
	}

	try {
		const job = new Job(name);
		await job.run();
		res.json({ ok: true });
	} catch (e) {
		res.status(500)
			.json({ message: e.message });
	}
});

module.exports = router;
