const { merge } = require("webpack-merge")
const commonMod = require("./webpack.app.common.config")

module.exports = (env) => {
  const common = commonMod(env);
  return merge(common, {
    mode: "production",
    output: {
      filename: 'dist/xcenic.[contenthash].js',
      chunkFilename: 'dist/[name].[contenthash].js',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {loader: 'postcss-loader', options: {postcssOptions: {path: "./"}}}
          ]
        }
      ]
    }
  })
};
