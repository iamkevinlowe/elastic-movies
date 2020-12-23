const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routerApiV1 = require('./routers/api/v1');

const app = express();
const port = process.env.PORT || 8080;

/** Body Parser */
app.use(bodyParser.urlencoded({ extended: false })); // application/x-www-form-urlencoded
app.use(bodyParser.json()); // application/json

/** Static Files */
app.use(express.static(path.join(__dirname, '../dist')));

/** Routing */
app.use('/v1', routerApiV1); // api v1 router
app.use('/', (req, res) => { // all non-matching routes
	res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
	console.log(`Elastic Movies listening at http://localhost:${port}`);
});
