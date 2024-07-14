const path = require('path');

module.exports = {
  mode: 'development', // veya 'production'
  entry: './src/index.js',
  resolve: {
    fallback: {
      vm: require.resolve('vm-browserify'),
      crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify')
    }
},
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
};
