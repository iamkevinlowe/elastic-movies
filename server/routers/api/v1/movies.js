const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.json({ ok: true, path: req.originalUrl });
});

module.exports = router;
