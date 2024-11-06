// config-overrides.js
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const webpack = require("webpack");

module.exports = function override(config) {
  config.plugins = (config.plugins || []).concat([
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      process: "process/browser", // Polyfill for process in the browser
    }),
  ]);

  config.resolve = {
    ...config.resolve,
    fallback: {
      net: false,
      tls: false,
      fs: false,
    },
  };

  return config;
};

