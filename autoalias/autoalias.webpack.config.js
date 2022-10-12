const { resolve } = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "production",
    target: 'node',
    devtool:false,
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            parallel: true,
            terserOptions: {
                compress: true,
                mangle: true,
                format: {
                    comments: false,
                },
            },
            extractComments : true
        })],
    },
    cache : false,
    entry: {
        autoalias : resolve(__dirname, "./src/autoalias.ts"),
    },
    output: {
        path: resolve(__dirname, "dist"),
        filename: "autoalias.js",
        library: "AutoAlias",
        libraryTarget: 'umd',
        globalObject : 'this',
        umdNamedDefine : true,
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"],
        fallback: {
            "fs": false,
            "path" : false
        },
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
    plugins: [
        new ESLintPlugin({
            extensions: ['js', 'ts'],
            fix:true,
            overrideConfigFile: resolve(__dirname, '.eslintrc'),
        }),
        new CopyPlugin({
            patterns: [
                {from : "../README.md", to: "./"}
            ]
        })
    ]
};