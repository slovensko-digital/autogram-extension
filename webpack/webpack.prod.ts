import * as webpack from "webpack";
import { merge } from "webpack-merge";
import common from "./webpack.common";

const config: webpack.Configuration = merge(common, {
  mode: "production",
  devtool: "source-map",
  output: {
    filename: "[name].bundle.js",
    clean: true,
  },
});

export default config;
