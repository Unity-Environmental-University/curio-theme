import path from 'path';
import { fileURLToPath } from 'url';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

// Emulate CommonJS __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development',
  optimization: {
   minimize: false,
  },
  devtool: "source-map",
  entry: './src/mainThemeWeb.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'unityCanvasThemeWeb.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    fallback: {
      path: 'path-browserify', // Directly specify the module name
      fs: false,              // Disable `fs` since it's Node-specific
    },
  },
  plugins: [
    new NodePolyfillPlugin(),
  ],
};
