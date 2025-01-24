import path from "path";
import * as webpack from "webpack";
// import { CleanWebpackPlugin } from "clean-webpack-plugin";
// import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";
import CopyPlugin from "copy-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import "webpack-dev-server";
import { manifestOptions } from "./manifest";
import { manifestVersion } from "./manifest-version";

let commitHash;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  commitHash = require("child_process")
    .execSync("git describe --always --dirty")
    .toString()
    .trim();
} catch (e) {
  commitHash = "unknown";
  console.error("Failed to get commit hash", e);
}
const config: webpack.Configuration = {
  entry: {
    background: "./src/entrypoint/background.ts",
    content: "./src/entrypoint/content.ts",
    inject: "./src/entrypoint/inject.ts",
    injectIntervalDetectDitec:
      "./src/entrypoint/inject-interval-detect-ditec.ts",
    popup: "./src/entrypoint/popup.ts",
    options: "./src/entrypoint/options.ts",
    redirect: "./src/entrypoint/redirect.ts",
  },
  mode: "development",
  devtool: "source-map",
  optimization: {
    usedExports: true,
    // splitChunks: {
    //   chunks(chunk) {
    //     return chunk.name !== "inject";
    //   },
    // },
  },
  output: {
    filename: "autogram-[name].[contenthash].js",
    path: path.resolve(__dirname, "../dist"),
    publicPath: "",
  },
  module: {
    rules: [
      // {
      //   test: /\.module\.css$/i,
      //   use: [
      //     "style-loader",
      //     {
      //       loader: "css-loader",
      //       options: {
      //         importLoaders: 1,
      //         modules: true,
      //         exportType: "array",
      //       },
      //     },
      //   ],
      // },
      {
        test: /\.css$/i,
        use: ["raw-loader"],
      },
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
        test: /\.html$/i,
        type: "asset/resource",
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      vm: require.resolve("vm-browserify"),
    },
  },
  plugins: [
    // new CleanWebpackPlugin(),
    // new ForkTsCheckerWebpackPlugin({
    //   typescript: {
    //     memoryLimit: 4096,
    //   },
    // }),

    new webpack.DefinePlugin({
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __MANIFEST_VERSION__: JSON.stringify(manifestVersion),
      __IS_PRODUCTION__: JSON.stringify(process.env.NODE_ENV === "production"),
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/static", to: "./static" },
        { from: "LICENSE", to: "./static" },
        { from: "src/_locales", to: "./_locales" },
      ],
    }),
    // new CopyPlugin({
    //   patterns: [{ from: "src/popup.html", to: "." }],
    // }),
    new ESLintPlugin({
      extensions: [".tsx", ".ts", ".js"],
      exclude: "node_modules",
    }),
    new WebpackManifestPlugin(manifestOptions),
  ],
};

export default config;
