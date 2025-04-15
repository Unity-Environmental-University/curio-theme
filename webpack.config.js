// webpack.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import TerserPlugin from "terser-webpack-plugin";

// Emulate CommonJS __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const common = {
  entry: {
    web: './src/mainThemeWeb.js',       // Entry point for the web file
    mobile: './src/mainThemeMobile.js',   // Entry point for the mobile file
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env','@babel/preset-react'],
          },
        },
      },
    ],
  },
  resolve: {
    fallback: {
      path: 'path-browserify',
      fs: false,
    },
  },
  plugins: [
    new NodePolyfillPlugin(),
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};

const devConfig = {
  ...common,
  mode: 'development',
  optimization: {
    minimize: false,
    concatenateModules: true,
  },
  devtool: 'eval-source-map',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'ueu_canvas_theme_[name].js',
  },
};

const prodConfig = {
  ...common,
  mode: 'production',
  optimization: {
    minimize: true,
    concatenateModules: true,
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],

  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'ueu_canvas_theme_[name].min.js',
  },
};

export default [ devConfig, prodConfig ];