export type VersionString = `${number}.${number}${"" | number}${
  | ""
  | `-${string}`}`;
// eslint-disable-next-line @typescript-eslint/ban-types
type Constructor<T> = Function & { prototype: T };
type MidMigrationError = { type: string; entity: string; error: unknown };
export type UpdateData = { _id: string; [index: string]: unknown };
export type MigrationFunction<T extends Entity<unknown>> = (
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

class MigrationError extends Error {
  constructor(
    public migration: MigrationData<Entity<unknown>>,
    public capturedErrors: MidMigrationError[]
  ) {
    super(
      `Migration failed, ${capturedErrors.length} exceptions thrown for type ${migration.type.name}, version "${migration.version}", sort ${migration.sort}`
    );
  }
}

function getCurrentVersion(): VersionString {
  const version = game.settings.get("swnr", VERSION_KEY);
  if (version !== "") return version;
  setCurrentVersion();
  return newVersion;
}

async function setCurrentVersion() {
  if (game.user.isGM) await game.settings.set("swnr", VERSION_KEY, newVersion);
}

export default async function checkAndRunMigrations(): Promise<void> {
  await loadMigrations();
  const migrations = orderedMigrations().filter((m) =>
    isNewerVersion(m.version, getCurrentVersion())
  );
  if (migrations.length === 0) return await setCurrentVersion();
  const oldVersion = await getCurrentVersion();
  if (!game.user.isGM)
    return ui.notifications.error(
      game.i18n.format(game.i18n.localize("swnr.migration.needsGM"), {
        count: migrations.length,
        oldVersion,
        newVersion,
      })
    );
  ui.notifications.warn(
    game.i18n.format(game.i18n.localize("swnr.migration.start"), {
      oldVersion,
      newVersion,
    })
  );
  for await (const migration of migrations) {
    const errors = await applyMigration(migration);
    if (errors.length > 0) {
      const error = new MigrationError(migration, errors);
      ui.notifications.error(error.message);
      console.error(error);
    }
  }
  await setCurrentVersion();
  ui.notifications.info(
    game.i18n.format(game.i18n.localize("swnr.migration.done"), { newVersion })
  );
}

export async function loadMigrations(): Promise<void> {
  const files = await (await fetch("systems/swnr/migrations.json")).json();
  await Promise.all(files.map((f) => import(f)));
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

async function applyMigration(migration: MigrationData<Entity<unknown>>) {
  const collections = Object.values(game).filter(
    // Block compendiums for now.
    (v) => v instanceof Collection && v.constructor !== Collection
  ) as Collection<Entity<unknown>>[];
  const errors = [] as MidMigrationError[];
  for await (const type of collections) {
    for await (const entity of type.values()) {
      try {
        await applyMigrationTo(entity, undefined, migration);
      } catch (e) {
        errors.push({
          type: type.constructor.name,
          entity: entity.constructor.name,
          error: e,
        });
      }
    }
  }
  return errors;
}

async function applyMigrationTo(
  target: Entity<unknown>,
  updateData = { _id: target._id } as UpdateData,
  migration: MigrationData<Entity<unknown>>
) {
  if (target instanceof migration.type) {
    migration.func(target, updateData);
  }
  if (!(target instanceof Entity)) {
    return updateData;
  }
  const embeddedEntities =
    (target.constructor as typeof Entity)?.config?.embeddedEntities ?? {};
  for await (const [cName, location] of Object.entries(embeddedEntities)) {
    const updates = [] as UpdateData[];
    const collection = target[location] ?? target.getEmbeddedCollection(cName);

    for await (const embedded of collection) {
      const eUpdate = await applyMigrationTo(embedded, undefined, migration);
      if (Object.keys(eUpdate).length > 1) updates.push(eUpdate);
    }
    target.updateEmbeddedEntity(cName, updates);
  }
  return updateData;
}
