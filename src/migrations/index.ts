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
  const migrations = orderedMigrations().filter((m) =>
    isNewerVersion(m.version, getCurrentVersion())
  );
  if (migrations.length === 0) return await setCurrentVersion();
  const oldVersion = await getCurrentVersion();
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

export function registerMigration<T extends Entity<unknown>>(
  type: Constructor<T>,
  version: VersionString,
  sort: number,
  func: MigrationFunction<T>
): void {
  if (!Object.prototype.isPrototypeOf.call(Entity, type))
    throw new TypeError(`${type.name} is not a Entity of some sort!`);
  _allMigrations.push({ type, version, sort, func });
}

export function orderedMigrations(): readonly MigrationData<Entity<unknown>>[] {
  return _allMigrations.sort((left, right) => {
    //Version sort, lowest first
    if (left.version !== right.version)
      return isNewerVersion(left.version, right.version) ? 1 : -1;
    //Sort No. order, lowest first
    if (left.sort !== right.sort) return left.sort - right.sort;
    //Prototype sort, if parent, sorted first.
    if (left.type !== right.type) {
      if (Object.prototype.isPrototypeOf.call(left.type, right.type)) return -1;
      if (Object.prototype.isPrototypeOf.call(right.type, left.type)) return 1;
    }
    return 0;
  });
}
