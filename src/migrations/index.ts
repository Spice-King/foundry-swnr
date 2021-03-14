type VersionString = `${number}.${number}${"" | number}${"" | `-${string}`}`;
// eslint-disable-next-line @typescript-eslint/ban-types
type Constructor<T> = Function & { prototype: T };
type MidMigrationError = { type: string; entity: string; error: unknown };
type UpdateData = { _id: string; [index: string]: unknown };
type MigrationFunction<T extends Entity<unknown>> = (
  entity: T,
  pastUpdates: UpdateData
) => UpdateData;
type MigrationData<T extends Entity<unknown>> = {
  type: Constructor<T>;
  version: VersionString;
  sort: number;
  func: MigrationFunction<T>;
};

const VERSION_KEY = "systemMigrationVersion";
let newVersion: VersionString = "0.0";
Hooks.on("init", () => (newVersion = game.system.data.version));
const _allMigrations = new Array<MigrationData<Entity<unknown>>>();

function getCurrentVersion(): VersionString {
  const version = game.settings.get("swnr", VERSION_KEY);
  if (version !== "") return version;
  setCurrentVersion();
  return newVersion;
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
