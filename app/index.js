const express = require('express');
const qs = require('qs');
const bodyParser = require('body-parser');
const path = require('path');

const routerApiV1 = require('./routers/api/v1');

const app = express();

/**	Query Parser */
app.set('query parser', queryString => qs.parse(queryString, { depth: 50 }));

/** Body Parser */
app.use(bodyParser.urlencoded({ extended: false })); // application/x-www-form-urlencoded
app.use(bodyParser.json()); // application/json

/** Routing */
app.use('/api/v1', routerApiV1); // api v1 router

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.resolve(__dirname, 'dist')));

	app.get('/*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
	});
}

const port = process.env.API_PORT;

app.listen(port, () => {
	console.log(`Elastic Movies API listening at http://localhost:${port}`);
});
