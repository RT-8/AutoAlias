const path = require("path");
const {AutoAlias, AutoAliasConfiguration, AutoAliasTarget} = require("../autoalias/dist/autoalias.js");

module.exports = {
  target: 'node',
  mode: 'development',
  devtool:false,
  entry: path.resolve(__dirname, 'src/hello_world.ts'),
    output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hello_world.js',
  },
  resolve: {
    alias : new AutoAlias(new AutoAliasConfiguration([new AutoAliasTarget(path.resolve(__dirname, './src'))],
     [".ts", ".tsx", ".js"],
      path.resolve(__dirname, "./tsconfig.json"))),
  },
  module: {
      rules: [
          // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
          {
              test: /\.tsx?$/,
              loader: "ts-loader",
              exclude: /node_modules/
          },
      ]
  },
};