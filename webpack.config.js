const webpack = require('webpack');
const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: {
    filename: './src/assets/scripts/app.js',
  },
  output: {
    filename: './dist/scripts/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        presets: [
          [ "env", {
            "targets": {
              "browsers": ["last 2 versions"]
            }
          }]
        ],
      },
    }),
  ],
};