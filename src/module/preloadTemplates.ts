export const preloadTemplates = async function (): Promise<void> {
  const list = await fetch("systems/swnr/templates.json");
  const files: string[] = await list.json();
  return loadTemplates(files.filter((t) => t.includes("fragment")));
};
