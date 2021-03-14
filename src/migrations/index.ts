type VersionString = `${number}.${number}${"" | number}${"" | `-${string}`}`;

const VERSION_KEY = "systemMigrationVersion";
let newVersion: VersionString = "0.0";
Hooks.on("init", () => (newVersion = game.system.data.version));

async function getCurrentVersion(): Promise<string> {
  if (game.settings.get("swnr", VERSION_KEY) === "") await setCurrentVersion();
  return game.settings.get("swnr", VERSION_KEY);
}

async function setCurrentVersion() {
  await game.settings.set("swnr", VERSION_KEY, newVersion);
}

export default async function checkAndRunMigrations(): Promise<void> {
  const oldVersion = await getCurrentVersion();
  let updates = false;
  if (newVersion === oldVersion) return;
  ui.notifications.warn(
    game.i18n.format(game.i18n.localize("swnr.migration.start"), {
      oldVersion,
      newVersion,
    })
  );
  await setCurrentVersion();
  ui.notifications.info(
    game.i18n.format(game.i18n.localize("swnr.migration.done"), { newVersion })
  );
}
