const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './public/js/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './public/dist')
  },
  module:{
    rules: [{
      test: /\.js$/,
      include: path.resolve(__dirname, './public/dist'),
      use:"imports-loader"
    }]
  },
  target: 'web'
};