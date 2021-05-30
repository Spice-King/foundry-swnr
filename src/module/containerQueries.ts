/// <reference types="resize-observer-browser" />
const sizes = {
  "cq:sm": 250,
  "cq:md": 350,
  "cq:lg": 500,
  "cq:xl": 700,
  "cq:2xl": 850,
};
const marker = Symbol("resize marker");
const callback = (entries: ResizeObserverEntry[]) => {
  entries.forEach((e) => {
    const element = e.target;
    if (!element.classList.contains("cq")) {
      resize.unobserve(element);
      delete e[marker];
      return;
    }
    Object.entries(sizes).forEach(([s, opt]) => {
      if (element.clientWidth >= opt) {
        element.classList.add(s);
      } else {
        element.classList.remove(s);
      }
    });
  });
};
const resize = new ResizeObserver(callback);
const mutation = new MutationObserver((e: MutationRecord[]) => {
  // console.log(e);
  const elements = [...e]
    .map((e) => {
      const getChildren = (e: Element) => [
        e,
        Array.from(e.childNodes).map(getChildren),
      ];
      const input = [
        e.target,
        ...Array.from(e.addedNodes).map(getChildren),
      ].deepFlatten();

      return input.flat();
      // return input
    })
    .reduce((a, b) => a.concat(b), [])
    .filter((e) => {
      return e instanceof Element && e.classList.contains("cq");
    }) as Element[];
  elements
    .filter((e) => !!e[marker] !== true)
    .forEach((e) => {
      e[marker] = true;
      resize.observe(e);
    });
});
mutation.observe(document, {
  subtree: true,
  childList: true,
});
