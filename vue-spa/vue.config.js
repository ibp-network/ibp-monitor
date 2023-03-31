const { defineConfig } = require('@vue/cli-service')

const fs = require('fs')
const path = require('path')
const { DefinePlugin } = require('webpack')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

module.exports = defineConfig({
  transpileDependencies: true,
  // `npm run build` will overwrite this location
  outputDir: path.resolve(__dirname, '../static'),
  configureWebpack: {
    plugins: [
      new DefinePlugin({
        'process.env.PACKAGE_VERSION': '"' + version + '"'
      })
    ]
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:30002',
        changeOrigin: true,
        // pathRewrite: {               // added this
        //   '^/api': ''                // added this
        // },
      },
      // '/metrics': {
      //   target: 'http://localhost:30001',
      //   changeOrigin: true,
      // }
    }
  }
})
