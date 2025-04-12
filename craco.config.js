// En tu archivo craco.config.js o similar (si usas CRACO)
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/@mediapipe\/tasks-vision/, // Excluir el paquete problemático
        ],
      });
      return webpackConfig;
    },
  },
};