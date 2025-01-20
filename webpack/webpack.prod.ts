import * as webpack from "webpack";
import { merge } from "webpack-merge";
import common from "./webpack.common";

const config: webpack.Configuration = merge(common, {
  mode: "production",
  devtool: "source-map",
  output: {
    filename: "autogram-[name].bundle.js",
    clean: true,
    publicPath: "",
  },
});

export default config;
