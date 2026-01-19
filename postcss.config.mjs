// PostCSS Configuration
const config = {
  plugins: {
    "postcss-import": {},
    "@tailwindcss/postcss": {},
    "postcss-nested": {},
    "postcss-preset-env": { stage: 2, features: { "nesting-rules": false } },
    autoprefixer: { flexbox: "no-2009", grid: "autoplace" },
    cssnano: { preset: ["default", { discardComments: { removeAll: false } }] },
  },
};
export default config;
