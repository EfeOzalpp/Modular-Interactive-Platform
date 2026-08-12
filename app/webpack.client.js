const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssPrefixSelector = require('postcss-prefix-selector');

const APP_DIR = __dirname;
const SRC_DIR = path.resolve(APP_DIR, 'src');
const BUILD_DIR = path.resolve(APP_DIR, 'build');

const shouldPrefixSelector = (selector) =>
  !(
    selector.startsWith('html') ||
    selector.startsWith('body') ||
    selector.startsWith(':root') ||
    selector.includes('#dynamic-theme') ||
    selector.includes('#dynamic-theme-ssr') ||
    selector.includes('#shadow-dynamic-app') ||
    selector.includes('::slotted')
  );

const createPostCssOptions = (loaderContext) => {
  const file = loaderContext.resourcePath || '';
  const isFontCss = /[\\/]fonts2?[\\/]/i.test(file);

  return {
    plugins: isFontCss
      ? []
      : [
          postcssPrefixSelector({
            prefix: '#main-shell',
            transform: (prefix, selector, prefixed) =>
              shouldPrefixSelector(selector) ? prefixed : selector,
          }),
        ],
  };
};

class AssetManifestPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('AssetManifestPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'AssetManifestPlugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          const files = {};
          for (const asset of compilation.getAssets()) {
            if (asset.name === 'asset-manifest.json') continue;
            files[asset.name] = `/${asset.name}`;
          }

          const entrypoints = (compilation.entrypoints.get('main')?.getFiles() || [])
            .filter((file) => !file.endsWith('.map'));
          const manifest = JSON.stringify({ files, entrypoints }, null, 2);
          compilation.emitAsset('asset-manifest.json', new webpack.sources.RawSource(manifest));
        }
      );
    });
  }
}

module.exports = (_env, argv) => {
  const mode = argv.mode || 'production';
  const isProduction = mode === 'production';
  const devServerPort = Number(process.env.PORT) || 3000;
  const styleLoader = isProduction ? MiniCssExtractPlugin.loader : require.resolve('style-loader');

  return {
    name: 'client',
    mode,
    target: 'web',
    entry: [
      path.resolve(SRC_DIR, 'polyfills/crypto-random-uuid.js'),
      path.resolve(SRC_DIR, 'index.js'),
    ],
    output: {
      path: BUILD_DIR,
      publicPath: '/',
      filename: isProduction
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/[name].js',
      chunkFilename: isProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      assetModuleFilename: 'static/media/[name].[contenthash:8][ext][query]',
      clean: isProduction,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      modules: [path.resolve(APP_DIR, 'node_modules')],
      alias: {
        q5$: path.resolve(SRC_DIR, 'vendor/q5-browser.js'),
        'skia-canvas': false,
        canvas: false,
      },
      fallback: {
        assert: false,
        buffer: false,
        child_process: false,
        crypto: false,
        dns: false,
        fs: false,
        http: false,
        https: false,
        net: false,
        os: false,
        path: false,
        stream: false,
        string_decoder: false,
        tls: false,
        url: false,
        util: false,
        zlib: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/i,
          include: SRC_DIR,
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: false,
              configFile: false,
              cacheDirectory: true,
              cacheCompression: false,
              presets: [
                [require.resolve('@babel/preset-env'), { targets: '>0.2%, not dead, not op_mini all' }],
                [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
                require.resolve('@babel/preset-typescript'),
              ],
              plugins: [require.resolve('@loadable/babel-plugin')],
            },
          },
        },
        {
          test: /\.css$/i,
          resourceQuery: /raw/,
          include: SRC_DIR,
          use: require.resolve('raw-loader'),
        },
        {
          test: /\.css$/i,
          resourceQuery: { not: [/raw/] },
          use: [
            styleLoader,
            {
              loader: require.resolve('css-loader'),
              options: { importLoaders: 1 },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: { postcssOptions: createPostCssOptions },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico|webp|avif|bmp|woff2?|eot|ttf|otf|cjs)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.PUBLIC_URL': JSON.stringify(''),
      }),
      new HtmlWebpackPlugin({ template: path.resolve(APP_DIR, 'public/index.html') }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(APP_DIR, 'public'),
            to: BUILD_DIR,
            globOptions: { ignore: ['**/index.html'] },
            noErrorOnMissing: true,
          },
        ],
      }),
      new LoadablePlugin({ filename: 'loadable-stats.json', writeToDisk: true }),
      new AssetManifestPlugin(),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: 'static/css/[name].[contenthash:8].css',
              chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
          ]
        : []),
    ],
    optimization: {
      splitChunks: { chunks: 'all' },
    },
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
    devServer: {
      host: process.env.HOST || '0.0.0.0',
      port: devServerPort,
      allowedHosts: 'all',
      hot: true,
      historyApiFallback: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
      static: { directory: path.resolve(APP_DIR, 'public'), watch: true },
      devMiddleware: { writeToDisk: (filePath) => /loadable-stats\.json$/.test(filePath) },
      client: {
        webSocketURL: `auto://0.0.0.0:${devServerPort}/ws`,
      },
    },
    performance: { hints: false },
    stats: 'minimal',
  };
};
