/** @type {import('prettier').Config} */
const config = {
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  singleQuote: true,
  jsxSingleQuote: true,
  arrowParens: 'avoid',
};

module.exports = config;
