import webpack from "webpack";
import { merge } from "webpack-merge";
import common from "./webpack.common";

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

const config = isDev
  ? merge(common, {
      mode: "development",
      devtool: "source-map",
      devServer: {
        static: "./dist",
      },
      output: {
        filename: "autogram-[name].bundle.js",
        publicPath: "",
      },
    })
  : merge(common, {
      mode: "production",
      output: {
        filename: "autogram-[name].[contenthash].js",
        publicPath: "",
      },
    });

webpack(config, (err, stats) => {
  if (err || stats?.hasErrors()) {
    console.error(err || stats?.toJson().errors);
    process.exit(1);
  }
  console.log(stats?.toString({ colors: true }));
});
