var webpack = require('webpack');
var path = require('path');

var APP_DIR = path.join(__dirname, 'src');

module.exports = {
  devtool: 'source-map', //alt 'source-map', 'eval'
  entry: {
    index: './src/index.ts',
    history: './src/stateHistory/index.ts',
    devtool: './src/devSlider/index.ts'
  },
  // externals: {
  //   // Use external version of React (don't bundle in package)
  //   // https://github.com/webpack/webpack/issues/1275#issuecomment-123846260
  //   react: 'React',
  // },
  // https://github.com/webpack/webpack/tree/master/examples/multi-part-library
  output: {
    path: path.join(__dirname, "lib"),
    filename: "redux-state-history.[name].js",
    library: ["redux-state-history", "[name]"],
    libraryTarget: "umd"
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
    // noParse: [ "react" ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      beautify: true,
      compressor: {
        warnings: false
      }
    })
  ],
  resolve: {
    root: [path.resolve('../src')],
    extensions: ['', '.jsx', '.js', '.tsx', '.ts'],
    // alias: {
    //   "react": "dummyReact.js"
    // }
  },
  tslint: {
    emitErrors: true,
    failOnHint: true,
  }
}
