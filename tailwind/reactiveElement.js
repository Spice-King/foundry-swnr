/* eslint-env node,script */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("tailwindcss/stubs/defaultConfig.stub");
let replace = false;
let usePrefix = true;
function inject(options = {}) {
  replace = !!options.replace;
  usePrefix = !replace || !!options.usePrefix;
  Object.entries(config.variants).forEach(([_k, v]) => {
    const index = v.indexOf("responsive");
    if (index >= 0) {
      v.splice(index, replace ? 1 : 0, "cq");
    }
  });
}

config.theme.cq = Object.keys(config.theme.screens);

const myPlugin = ({ addVariant, theme, postcss, e }) => {
  const fixes = theme("cq");
  if (!fixes) return;
  const out = new Map();
  fixes.forEach((e) => out.set(e, []));

  addVariant(
    "cq",
    ({ separator, container }) => {
      [...container.nodes].forEach((node) => {
        if (!(node instanceof postcss.Rule) || node instanceof postcss.AtRule)
          return;
        fixes.forEach((l) => {
          const selectorPrefix = usePrefix
            ? `.cq${e(separator + l + separator)}`
            : "." + e(l + separator);
          const cloned = node.clone();
          cloned.selector = `.cq${e(separator + l)} ${
            selectorPrefix + cloned.selector.slice(1)
          }`;
          out.get(l).push(cloned);
        });
        container.removeAll();
      });
      fixes.forEach((l) => {
        out.get(l).forEach((node) => {
          container.append(node);
        });
        out.set(l, []);
      });
      return;
    },
    { unstable_stack: true }
  );
};

module.exports = (replace) => {
  inject(replace);
  return myPlugin;
};
