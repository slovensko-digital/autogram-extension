import path from "path";
import * as webpack from "webpack";
import { merge } from "webpack-merge";
import common from "./webpack.common";

const config: webpack.Configuration = merge(common, {
  mode: "production",
  devtool: "source-map",
  output: {
    path: "/User/pom/projects/slovensko.digital/sk-sk-extension/build",
    filename: "[name].x.bundle.js",
    clean: true,
  },
});

export default config;
