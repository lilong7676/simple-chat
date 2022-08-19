import {
  Configuration,
  HotModuleReplacementPlugin,
  RuleSetRule,
} from 'webpack';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as webpackDevServer from 'webpack-dev-server';
import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackHarddiskPlugin from 'html-webpack-harddisk-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import localConfig from './static.config';

const isDev = process.env.NODE_ENV === 'development';

console.log('process.env.NODE_ENV', process.env.NODE_ENV);

const config: Configuration = {
  mode: isDev ? 'development' : 'production',
  entry: './src/index.tsx',
  output: isDev
    ? {
        path: localConfig.distDir,
        publicPath: `http://${localConfig.devServer.host}:${localConfig.devServer.port}/`,
      }
    : {
        path: localConfig.distDir,
        filename: '[name].js',
        publicPath: '/app/static',
      },
  module: {
    rules: [
      // ts js
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: (() => {
              const plugins = [
                [
                  '@babel/plugin-transform-runtime',
                  {
                    regenerator: true,
                    helpers: false,
                  },
                ],
              ];
              if (isDev) {
                plugins.splice(0, 0, [require.resolve('react-refresh/babel')]);
              }
              return plugins;
            })(),
          },
        },
      },
      // css
      {
        test: /\.css$/i,
        use: (() => {
          if (isDev) {
            return ['style-loader', 'css-loader', 'postcss-loader'];
          }
          // production mode
          return [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                // 样式文件内部的资源路径不使用output.publicPath，直接使用当前css所在地址即可
                publicPath: '',
              },
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                modules: {
                  auto: true,
                  localIdentName: '[path][name]__[local]--[hash:base64:5]',
                },
              },
            },
            'postcss-loader',
          ];
        })(),
      },
      // less
      {
        test: /\.less$/i,
        use: (() => {
          const use: RuleSetRule['use'] = [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                modules: {
                  auto: true,
                  localIdentName: isDev
                    ? '[path][name]__[local]'
                    : '[path][name]__[local]--[hash:base64:5]',
                },
              },
            },
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  strictMath: true,
                },
              },
            },
            'postcss-loader',
          ];

          if (isDev) {
            use.splice(0, 0, {
              loader: 'style-loader',
            });
          } else {
            use.splice(0, 0, {
              loader: MiniCssExtractPlugin.loader,
              options: {
                // 样式文件内部的资源路径不使用output.publicPath，直接使用当前css所在地址即可
                publicPath: '',
              },
            });
          }
          return use;
        })(),
      },
      // png|jpg|gif
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024, // 4kb
          },
        },
        generator: {
          filename: 'images/[hash][ext][query]',
        },
      },
      // svg
      {
        test: /\.svg/,
        type: 'asset/inline',
      },
      // pug
      {
        test: /\.pug$/,
        loader: '@webdiscus/pug-loader',
      },
    ],
  },
  plugins: (() => {
    let plugins: Configuration['plugins'] = [
      new HtmlWebpackPlugin({
        template: 'public/index.pug',
        filename: 'index.ejs',
        minify: !isDev,
        hash: !isDev,
        favicon: 'public/favicon.ico',
        alwaysWriteToDisk: isDev,
      }),
    ];

    if (isDev) {
      plugins = [
        ...plugins,
        new HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin(),
        new HtmlWebpackHarddiskPlugin(),
      ];
    } else {
      plugins = [
        new CleanWebpackPlugin(),
        ...plugins,
        new MiniCssExtractPlugin(),
      ];
    }

    return plugins;
  })(),
  devtool: isDev ? 'inline-source-map' : false,
  devServer: {
    static: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    compress: true,
    host: localConfig.devServer.host,
    port: localConfig.devServer.port,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
      },
    },
    headers: { 'Access-Control-Allow-Origin': '*' },
    // devMiddleware: {
    //   index: false,
    //   writeToDisk: true,
    // },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          test: /[\\/]node_modules[\\/](?!@lilong767676[\\/])/,
          name: 'vendor',
          enforce: true,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: {
      name: 'runtime',
    },
  },
};

export default config;
