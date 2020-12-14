const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const routerApiV1 = require('./routers/api/v1');

// api v1 router
app.use('/api/v1', routerApiV1);

app.listen(port, () => {
	console.log(`Elastic Movies listening at http://localhost:${port}`);
});
