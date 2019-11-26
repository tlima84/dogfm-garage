const path = require('path');


module.exports = {
  entry: './src/server/server.js',
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: false
  },
  node: {
    fs: 'empty'
  },
  target: 'node'
};