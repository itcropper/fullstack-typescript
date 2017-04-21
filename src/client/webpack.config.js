const path = require('path');
const webpack = require('webpack');
const version = require('../../package.json').version;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

const production = process.env.NODE_ENV === 'production';
const projectRoot = path.join(__dirname, '..', '..');

const plugins = [
  new HtmlWebpackPlugin({
    title: 'TypeScript and React',
    filename: 'index.html',
    template: 'index.ejs'
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: ({resource}) => /node_modules/.test(resource),
  })
];

if (!production) {
  plugins.push(new OpenBrowserPlugin({ url: 'http://localhost:3000' }));
}

module.exports = {
  devtool: production ? '' : 'inline-source-map',
  entry: ['babel-polyfill', './client'],
  output: {
    path: path.join(projectRoot, 'dist', 'public'),
    filename: `[name]-${version}-bundle.js`,
    publicPath: '/public/'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  module: {
    loaders: [{
      test: /\.tsx?$/,
      loaders: ['awesome-typescript-loader']
    }]
  },
  plugins
};