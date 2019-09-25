module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'sedaScatterplot',
      externals: {
        react: 'React'
      }
    }
  },
  babel: {
    cherryPick: ['d3-array', 'd3-scale'],
    plugins: [
      'transform-class-properties',
      'transform-es2015-arrow-functions',
      'transform-es2015-spread',
      'transform-es2015-destructuring',
      'transform-es2015-classes',
      'syntax-class-properties',
      'transform-class-constructor-call',
      'transform-es2015-parameters'
    ],
    presets: ["es2015", "stage-0", "react"]
  }
}
