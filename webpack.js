var webpack = require('webpack');
var path = require('path');

var APP_DIR = path.join(__dirname, 'src');

module.exports = {
  devtool: 'source-map', //alt 'source-map', 'eval'
  entry: {
    StateHistoryTracker: './src/indexStateHistoryTracker.ts',
    DevSlider: './src/indexDevSlider.ts'
  },
  output: {
    path: 'lib',
    filename: '[name].js' // Template based on keys in entry above
  },
  module: {
    preLoaders: [
      {
        test: /\.ts(x)$/,
        loader: "tslint",
        include: APP_DIR
      }
    ],
    loaders: [
      {
        test: /\.ts(x)?$/,
        loaders: [
          'babel',
          'ts-loader'
        ],
        include: APP_DIR
      },
    ],
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ],
  resolve: {
    root: [path.resolve('../src')],
    extensions: ['', '.jsx', '.js', '.tsx', '.ts']
  },
  tslint: {
    emitErrors: true,
    failOnHint: true,
  }
}
