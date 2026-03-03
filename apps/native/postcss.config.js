module.exports = {
  plugins: [
    require('tailwindcss'),
    require('nativewind/postcss'), // No need for extra brackets
    require('postcss-css-variables'),
    require('postcss-color-functional-notation'),
    require('postcss-calc')({
      warnWhenCannotResolve: true
    }),
    require('postcss-nested')({
      bubble: ['selector']
    })
  ]
}
