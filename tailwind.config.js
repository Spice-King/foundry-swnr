/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node, script */
const reactiveElement = require("./tailwind/reactiveElement");
const colors = require("tailwindcss/colors");
module.exports = {
  purge: ["src/**/*.ts", "src/**/*.yaml", "src/**/*.yml", "src/**/*.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      transitionProperty: {
        ["text-shadow"]: "text-shadow",
      },
      colors: {
        blueGray: colors.blueGray,
        coolGray: colors.coolGray,
        warmGray: colors.warmGray,
        trueGray: colors.trueGray,
      },
    },
  },
  variants: {
    extend: {
      height: ["cq"],
    },
  },
  plugins: [
    reactiveElement({ replace: true }),
    require("./tailwind/textShadow"),
  ],
};
