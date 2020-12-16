const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

/** Cors */
const cors = require('cors');
const corsOptions = {
	origin: 'http://localhost:8080',
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

/** Body Parser */
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

/** Routing */
const routerApiV1 = require('./routers/api/v1');
// api v1 router
app.use('/api/v1', routerApiV1);

app.listen(port, () => {
	console.log(`Elastic Movies listening at http://localhost:${port}`);
});
