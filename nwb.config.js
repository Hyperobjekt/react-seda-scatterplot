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
    cherryPick: ['babel-plugin-transform-parameters', 'babel-plugin-transform-spread', 'babel-plugin-transform-destructuring', 'plugin-transform-arrow-functions'],
    env: {
      targets: {
        browsers: "> 0.5%, not dead",
        ie: "11"
      },
      modules: 'umd'
    },
    runtime: "polyfill",
    stage: 0
  }
}
