import webpack from "webpack";
import { merge } from "webpack-merge";
import common from "./webpack.common";

const config = merge(common, {
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

const compiler = webpack(config);

// Use the watch API
compiler.watch(
  {
    aggregateTimeout: 300,
    poll: undefined,
    ignored: /node_modules/,
  },
  (err, stats) => {
    if (err || stats?.hasErrors()) {
      console.error(err || stats?.toJson().errors);
      return;
    }
    console.log(stats?.toString({ colors: true }));
  }
);

// Handle graceful shutdown
process.on("SIGINT", () => {
  compiler.close(() => {
    console.log("Webpack watcher closed");
    process.exit(0);
  });
});
