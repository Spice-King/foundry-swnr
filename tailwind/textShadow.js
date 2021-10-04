/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable-next-line no-undef */
const plugin = require("tailwindcss/plugin");

// eslint-disable-next-line no-undef
module.exports = plugin(
  ({ addUtilities, e, theme }) => {
    const themeTextShadows = theme("textShadows");
    const colors = theme("colors");
    const defaultShadowColor = "rgb(107, 114, 128)";
    const textShadows = {
      [".text-shadow-none"]: { "text-shadow": "unset" },
    };
    Object.entries(themeTextShadows).forEach(([rawKey, rawValue]) => {
      const key =
        ".text-shadow" + (rawKey === "DEFAULT" ? "" : "-" + e(rawKey));
      const value = rawValue instanceof Array ? rawValue : [rawValue];

      textShadows[key] = {
        "--tw-text-shadow-color": defaultShadowColor,
        "text-shadow": value
          .map((v) => v + " var(--tw-text-shadow-color)")
          .join(", "),
      };
    });
    // console.log(colors);
    const shadowColors = {};
    const colorLoop = (name, value) => {
      if (typeof value === "string") {
        shadowColors[name] = {
          "--tw-text-shadow-color": value,
        };
      } else {
        Object.entries(value).forEach(([key, value]) =>
          colorLoop(`${name}-${key}`, value)
        );
      }
    };
    colorLoop(".text-shadow", colors);
    addUtilities(textShadows, ["hover", "focus"]);
    addUtilities(shadowColors, ["hover", "focus"]);
  },
  { theme: { textShadows: { DEFAULT: "0 0 8px" } } }
);
