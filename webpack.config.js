var path = require("path");
var webpack = require("webpack");
var merge = require("webpack-merge");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var autoprefixer = require("autoprefixer");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var entryPath = path.join(__dirname, "src/static/index.js");
var outputPath = path.join(__dirname, "dist");


// determine build env
var TARGET_ENV = process.env.npm_lifecycle_event === "build_locally"
  ? "production"
  : "development";
var outputFilename = TARGET_ENV === "production"
  ? "[name]-[hash].js"
  : "[name].js";

// common webpack config
var commonConfig = {
  output: {
    path: outputPath,
    filename: `./src/static/js/${outputFilename}`
  },

  resolve: {
    extensions: [".js", ".elm"]
  },

  module: {
    noParse: /\.elm$/,
    loaders: [
      {
        test: /\.(eot|ttf|woff|woff2|svg)$/,
        loader: "file-loader"
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "src/static/index.html",
      inject: "body",
      filename: "index.html"
    }),
  ],
};

// additional webpack settings for local env (when invoked by 'npm start')
if (TARGET_ENV === "development") {
  console.log("Serving locally...");

  module.exports = merge(commonConfig, {
    entry: ["webpack-dev-server/client?http://localhost:8080", entryPath],

    devServer: {
      // serve index.html in place of 404 responses
      historyApiFallback: true,
      contentBase: "./src"
    },

    module: {
      loaders: [
        {
          test: /\.elm$/,
          exclude: [/elm-stuff/, /node_modules/],
          loader: "elm-hot-loader!elm-webpack-loader?verbose=true&warn=true&debug=true"
        },
        {
          test: /\.(css|less)$/,
          loaders: [
            "style-loader",
            "css-loader",
            "postcss-loader",
            "less-loader"
          ]
        }
      ]
    }
  });
}

// additional webpack settings for prod env (when invoked via 'npm run build')
if (TARGET_ENV === "production") {
  console.log("Running production build...");

  module.exports = merge(commonConfig, {
    entry: entryPath,

    module: {
      loaders: [
        {
          test: /\.elm$/,
          exclude: [/elm-stuff/, /node_modules/],
          loader: "elm-webpack"
        },
        {
          test: /\.(css|scss)$/,
          loader: ExtractTextPlugin.extract("style-loader", [
            "css-loader",
            "postcss-loader",
            "less-loader"
          ])
        }
      ]
    },

    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),

      // extract CSS into a separate file
      new ExtractTextPlugin("/static/css/[name]-[hash].css", {
        allChunks: true
      }),

      // minify & mangle JS/CSS
      new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        compressor: { warnings: false }
        // mangle:  true
      })
    ]
  });
}
