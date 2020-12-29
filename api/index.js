require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const routerApiV1 = require('./routers/api/v1');

const app = express();
const port = process.env.API_PORT;

/** Body Parser */
app.use(bodyParser.urlencoded({ extended: false })); // application/x-www-form-urlencoded
app.use(bodyParser.json()); // application/json

/** Routing */
app.use('/v1', routerApiV1); // api v1 router

app.listen(port, () => {
	console.log(`Elastic Movies API listening at http://localhost:${port}`);
});
