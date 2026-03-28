import * as webpack from "webpack";
import { merge } from "webpack-merge";
import common from "./webpack.common";

const config: webpack.Configuration = merge(common, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    static: "./dist",
  },
  output: {
    filename: "autogram-[name].bundle.js",
    publicPath: "",
  },
});

export default config;
