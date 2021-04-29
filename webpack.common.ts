import path from "path";
import * as webpack from "webpack";
// import { CleanWebpackPlugin } from "clean-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import {
  WebpackManifestPlugin,
  Options as WMPOptions,
  FileDescriptor,
} from "webpack-manifest-plugin";
import CopyPlugin from "copy-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import "webpack-dev-server";
const packageJson = require("./package.json");

function generateManifest(
  seed: object,
  files: FileDescriptor[],
  entries: Record<string, string[]>
): object {
  // console.log(seed);
  // console.log(files);
  // console.log(entries);
  return {
    manifest_version: 2,
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    author: "pom",

    permissions: ["storage"],

    icons: {
      "16": "src/img/syringe-16.png",
      "32": "src/img/syringe-32.png",
      "48": "src/img/syringe-48.png",
      "128": "src/img/syringe-128.png",
    },
    // options_page: "src/ui/options.html",
    content_scripts: [
      {
        matches: ["https://www.slovensko.sk/*"],
        css: ["src/extension.css"],
        js: [entries.content],
      },
    ],
  };
}

const manifestOptions: WMPOptions = {
  fileName: "manifest2.json",
  generate: generateManifest,
};

const config: webpack.Configuration = {
  entry: {
    index: "./src/index.ts",
    background: "./src/background.ts",
    content: "./src/content.ts",
  },
  mode: "development",
  devtool: "source-map",
  optimization: {
    usedExports: true,
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
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
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new CopyPlugin({
      patterns: [{ from: "src/static", to: "." }],
    }),
    new ESLintPlugin({
      extensions: [".tsx", ".ts", ".js"],
      exclude: "node_modules",
    }),
    new WebpackManifestPlugin(manifestOptions),
  ],
};

export default config;
