const path = require('path');


const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
  entry: {
    'app': './App.js',
  },
  output: {
    path: path.join(__dirname, "build/dist"),
    filename: "[name].js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      inlineSource: ".(js|css)$",
      title: "Gritty Viddy",
      template: "single-index.html",
      inject: "head"
    }),
    new HtmlWebpackInlineSourcePlugin()
  ]
};
