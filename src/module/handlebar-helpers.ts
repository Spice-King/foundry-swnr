import { SWNRCharacterActor } from "./actors/character";
import { SWNRWeapon } from "./items/weapon";

export default function registerHelpers(): void {
  Handlebars.registerHelper("debug", function () {
    return JSON.stringify(this, null, 2);
  });
  Handlebars.registerHelper("stringify", function (obj) {
    return JSON.stringify(obj, null, 2);
  });
  Handlebars.registerHelper("concat", function (a, b) {
    return a + b;
  });
  Handlebars.registerHelper("zeroWidthBreaker", (message: string) => {
    return new Handlebars.SafeString(
      message.replace(
        /[:/]/g,
        (match) => Handlebars.Utils.escapeExpression(match) + "&#8203;"
      )
    );
  });
  Handlebars.registerHelper(
    "getPCStatModForWeapon",
    (
      actor: SWNRCharacterActor,
      weapon: SWNRWeapon,
      forDamage = false
    ): number => {
      // if (forDamage && weapon.data.data.skillBoostsDamage === true) return 0;
      const stat = weapon.data.data.stat;
      const stats = actor.data.data.stats;
      // if (stat === "str/dex") return Math.max(stats.str.mod, stats.dex.mod);
      // if (stat === "con/wis") return Math.max(stats.con.mod, stats.wis.mod);
      return stats[stat].mod;
    }
  );
}
