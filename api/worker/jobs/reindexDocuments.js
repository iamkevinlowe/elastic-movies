const Movie = require('../../classes/Movie');
const Elasticsearch = require('../../classes/Elasticsearch');

const esClient = new Elasticsearch({ node: process.env.ES_HOST || 'http://es01:9200' });

/**
 * Copies documents from source index to target index
 *
 * @param {string} sourceIndex
 * @param {string} targetIndex
 * @param {Object} mappings
 * @returns {Promise<void>}
 */
const main = async (sourceIndex, targetIndex, mappings) => {
	// Delete original index
	console.log(
		'indices.delete response:',
		await esClient.request('indices.delete', { index: targetIndex })
	);

	// Recreate original index
	console.log(
		'indices.create response:',
		await esClient.request('indices.create', {
			index: targetIndex,
			body: { mappings: mappings }
		})
	);

	// Reindex
	console.log(
		'reindex response:',
		await esClient.request('reindex', {
			timeout: '5m',
			body: {
				source: { index: sourceIndex },
				dest: { index: targetIndex }
			}
		})
	);

	// Check stats
	console.log(
		'cat.recover response:',
		await esClient.request('cat.recovery', { index: targetIndex })
	);

	// Delete source index
	console.log(
		'indices.delete response:',
		await esClient.request('indices.delete', { index: sourceIndex })
	);
};

// main('movies_2', 'movies', Movie.getIndexMapping())
// 	.catch(console.error)
// 	.finally(() => console.log('Done!'));

module.exports = main;
