import path from 'path';

export default {
  devServer: {
    host: '0.0.0.0',
    port: 4000,
  },
  distDir: path.resolve(__dirname, 'dist'),
};
