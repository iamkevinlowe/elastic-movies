const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = env => {
	let API_HOST = '';

	if (env.NODE_ENV === 'development') {
		API_HOST = 'http://localhost/api/';
	}

	return {
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
			}),
			new webpack.EnvironmentPlugin({
				API_HOST
			})
		],
		devServer: {
			contentBase: path.join(__dirname, 'dist'),
			compress: true,
			historyApiFallback: true,
			host: '0.0.0.0',
			port: 3000,
		},
		devtool: 'source-map'
	};
};
