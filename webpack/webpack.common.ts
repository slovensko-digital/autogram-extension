import path from "path";
import * as webpack from "webpack";
// import { CleanWebpackPlugin } from "clean-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";
import CopyPlugin from "copy-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import "webpack-dev-server";
import { manifestOptions } from "./manifest";

const config: webpack.Configuration = {
  entry: {
    index: "./src/index.ts",
    background: "./src/background.ts",
    content: "./src/content.ts",
    inject: "./src/inject.ts",
    popup: "./src/popup.ts",
  },
  mode: "development",
  devtool: "source-map",
  optimization: {
    usedExports: true,
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "../dist"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            // disable type checker - we will use it in fork plugin
            transpileOnly: true,
          },
        },
      },
      {
        resourceQuery: /astext/,
        type: "asset/source",
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new CopyPlugin({
      patterns: [{ from: "src/static", to: "./static" }],
    }),
    new CopyPlugin({
      patterns: [{ from: "src/popup.html", to: "." }],
    }),
    new ESLintPlugin({
      extensions: [".tsx", ".ts", ".js"],
      exclude: "node_modules",
    }),
    new WebpackManifestPlugin(manifestOptions),
  ],
};

export default config;
