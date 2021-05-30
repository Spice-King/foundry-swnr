/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
module.exports = {
  map: false,
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    require("postcss-nested"),
    require("postcss-initial"),
    require("postcss-for"),
    require("postcss-simple-vars"),
    require("postcss-color-mix"),
    require("postcss-jsmath"),
    require("postcss-conditionals"),
  ],
};
if (process.env.NODE_ENV?.toLocaleLowerCase() === "production")
  module.exports.plugins.push(require("cssnano")({ preset: "default" }));
