const webpack = require('webpack')
const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: {
    app: ['@babel/polyfill', './src/index'],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader', 'react-hot-loader/webpack']},
      {test: /\.(png|svg)$/, loader: 'file-loader'},
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // disable type checker - we will use it in fork plugin
              transpileOnly: true,
            },
          },
        ],
      },
    ],
    noParse: [/node_modules\/ws/],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  plugins: [new ForkTsCheckerWebpackPlugin(), new webpack.EnvironmentPlugin(['NODE_ENV'])],
}

if (process.env.NODE_ENV === 'production') {
  module.exports.entry = {
    app: ['@babel/polyfill', './src/index'],
  }

  module.exports.plugins.push(new HtmlWebpackPlugin({template: 'index.html', inject: false}))
}
