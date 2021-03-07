export const registerSettings = function (): void {
  // Register any custom system settings here

  /**
   * Track the system version upon which point a migration was last applied
   */
  game.settings.register("swnr", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  game.settings.register("swnr", "useHomebrewLuckSave", {
    name: "swnr.settings.useHomebrewLuckSave",
    hint: "swnr.settings.useHomebrewLuckSaveHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });
};
