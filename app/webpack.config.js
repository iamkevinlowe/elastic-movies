const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = env => {
	const config = {
		entry: './src/index.js',
		output: {
			publicPath: '/'
		},
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				},
				{
					test: /\.scss$/,
					use: ['style-loader', 'css-loader', 'sass-loader']
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: ['babel-loader']
				}
			]
		},
		optimization: {
			splitChunks: { chunks: "all" }
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: path.resolve(__dirname, 'src', 'index.html')
			})
		]
	};

	if (env.NODE_ENV === 'development') {
		config.devServer = {
			contentBase: path.join(__dirname, 'dist'),
			compress: true,
			historyApiFallback: true,
			host: '0.0.0.0',
			port: process.env.WEB_PORT,
			proxy: {
				'/api': `http://localhost:${process.env.API_PORT}`,
				'/queue': 'http://worker:9000'
			}
		};

		config.devtool = 'source-map';
		config.mode = 'development';
	} else {
		config.mode = 'production';
	}

	return config;
};
