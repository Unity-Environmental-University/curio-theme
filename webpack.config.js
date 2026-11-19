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

const stamp = `curio-theme v${version} ${sha}`;

/**
 * Emits the hand-written stylesheet into the build output so every file that gets uploaded to the
 * Theme Editor comes from one folder. No processing beyond a version comment on the first line.
 * The same stylesheet goes to both the web and mobile CSS slots.
 */
class EmitThemeCssPlugin {
  apply(compiler) {
    const { RawSource } = webpack.sources;
    compiler.hooks.thisCompilation.tap("EmitThemeCssPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: "EmitThemeCssPlugin", stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        () => {
          const css = fs.readFileSync(path.join(__dirname, "src/css/custom_web.css"), "utf8");
          const out = new RawSource(`/* ${stamp} */\n${css}`);
          compilation.emitAsset("ueu_canvas_theme_web.css", out);
          compilation.emitAsset("ueu_canvas_theme_mobile.css", out);
        }
      );
    });
  }
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
      banner: `/* ${stamp} */window.__curioThemeVersion=${JSON.stringify(`${version} ${sha}`)};`,
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
  // Readable bundles with external source maps. Not eval-based, so they can be diffed and read as-is.
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "build", "dev"),
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
  plugins: [...common.plugins, new EmitThemeCssPlugin()],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "ueu_canvas_theme_[name].min.js",
  },
};

// Default (`npm run build`): upload files in build/ plus unminified debug bundles in build/dev/.
// `--env dev` builds only build/dev/ (used by `npm run watch`).
export default (env) => (env && env.dev ? [devConfig] : [prodConfig, devConfig]);
