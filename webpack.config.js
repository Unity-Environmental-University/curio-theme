// webpack.config.js
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import webpack from "webpack";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

// Emulate CommonJS __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));
let sha = "unknown";
try {
  sha = execSync("git rev-parse --short HEAD", { cwd: __dirname, stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();
} catch (e) {
  /* not a git checkout; leave as "unknown" */
}

const common = {
  entry: {
    web: "./src/mainThemeWeb.js", // Entry point for the web file
    mobile: "./src/mainThemeMobile.js", // Entry point for the mobile file
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
    ],
  },
  resolve: {
    fallback: {
      path: "path-browserify",
      fs: false,
    },
  },
  plugins: [
    new NodePolyfillPlugin(),
    // Stamp every bundle with the package version + commit so a deployed file can be traced to git.
    new webpack.BannerPlugin({
      banner: `/* curio-theme v${version} ${sha} */window.__curioThemeVersion=${JSON.stringify(`${version} ${sha}`)};`,
      raw: true,
      entryOnly: true,
    }),
  ],
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
};

const devConfig = {
  ...common,
  mode: "development",
  optimization: {
    minimize: false,
    concatenateModules: true,
  },
  devtool: "eval-source-map",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "ueu_canvas_theme_[name].js",
  },
};

const prodConfig = {
  ...common,
  mode: "production",
  optimization: {
    minimize: true,
    concatenateModules: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "ueu_canvas_theme_[name].min.js",
  },
};

// `npm run build` -> production (.min.js) only; `npm run build:dev` / `npm run watch` -> dev bundle only.
export default (env) => (env && env.dev ? [devConfig] : [prodConfig]);
