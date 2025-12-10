const config = {
  projectName: 'tsinglan-mobile',
  date: '2024-01-01',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: 'webpack5',
  cache: {
    enable: false,
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
  },
  weapp: {},
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev')); // eslint-disable-line global-require
  }
  return merge({}, config, require('./prod')); // eslint-disable-line global-require
};
