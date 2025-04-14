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
   concatenateModules: true,
  },
  devtool: false,
  entry: {
    web: './src/mainThemeWeb.js',       // Entry point for the web file
    mobile: './src/mainThemeMobile.js', // Entry point for the mobile file
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'ueu_canvas_theme_[name].js',
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
      path: 'path-browserify', // Directly specify the module name
      fs: false,              // Disable `fs` since it's Node-specific
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
