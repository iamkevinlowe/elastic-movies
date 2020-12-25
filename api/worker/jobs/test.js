const Elasticsearch = require('../../classes/Elasticsearch');
const Movie = require('../../classes/Movie');

const esClient = new Elasticsearch({ node: 'http://localhost:9200' });
const newEsClient = new Elasticsearch({ node: 'http://localhost:9201' });

const main = async () => {
	if (!await esClient.ping()) {
		throw new Error('Main is NOT connected');
	}

	if (!await newEsClient.ping()) {
		throw new Error('Cluster is NOT connected');
	}

	if (await esClient.request('indices.exists', { index: Movie.INDEX })) {
		console.log('Main has index');
	} else {
		await esClient.request('indices.create', { index: Movie.INDEX });
		await esClient.request('indices.putMapping', {
			index: Movie.INDEX,
			body: Movie.getIndexMapping()
		});
	}

	if (await newEsClient.request('indices.exists', { index: Movie.INDEX })) {
		console.log('Cluster has index');
	} else {
		await newEsClient.request('indices.create', { index: Movie.INDEX });
		await newEsClient.request('indices.putMapping', {
			index: Movie.INDEX,
			body: Movie.getIndexMapping()
		});
	}

	let total = 0;
	let processed = 0;

	do {
		const response = await getFromOldNode(processed);

		total = total || response.hits.total.value;
		await Promise.all(response.hits.hits.map(async ({ _source: item }) => {
			const insertResponse = await insertToNewNode(item);
			processed++;
			console.log(`${processed}/${total} - ${capitalize(insertResponse.result)} ${item.title}`);
		}));
	} while (processed < total)

};

const getFromOldNode = async (from = 0) => {
	return await esClient.request('search', { index: Movie.INDEX, from });
};

const insertToNewNode = async (item) => {
	return await newEsClient.request('index', { index: Movie.INDEX, id: item.id, body: item });
};

const capitalize = string => `${string.slice(0, 1).toUpperCase()}${string.slice(1)}`;

main()
	.catch(error => console.error('ERROR: ', error))
	.finally(() => process.exit());

module.exports = main;
