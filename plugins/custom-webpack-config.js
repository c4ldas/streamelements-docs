// File: plugins/custom-webpack-config/index.js
const { ProvidePlugin } = require('webpack')

module.exports = function () {
  return {
    name: 'custom-webpack-config',

    configureWebpack() {
      return {
        module: {
          rules: [
            {
              test: /\.m?js/,
              resolve: {
                fullySpecified: false
              }
            }
          ]
        },

        plugins: [
          new ProvidePlugin({
            process: require.resolve('process/browser')
          })
        ],

        resolve: {
          fallback: {
            buffer: require.resolve('buffer'),
            stream: false,
            path: false,
            process: false
          }
        }
      }
    }
  }
}
