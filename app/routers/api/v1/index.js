const express = require('express');
const router = express.Router();
const routerMovies = require('./movies');
const routerJobs = require('./jobs');
const routerQueues = require('./queues');

router.use('/movies', routerMovies);
router.use('/jobs', routerJobs);
router.use('/queues', routerQueues);

module.exports = router;
