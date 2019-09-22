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
    plugins: ['@babel/plugin-transform-arrow-functions', '@babel/plugin-transform-spread', '@babel/plugin-transform-destructuring'],
    env: {
      targets: {
        browsers: "> 0.5%, not dead",
        ie: "11"
      },
      modules: 'umd'
    },
    runtime: "polyfill",
    stage: 0,
    presets: [
        "@babel/env",
        "@babel/react"
    ]
  }
}
