import { SWNRCharacterActor } from "./actors/character";
import { SWNRWeapon } from "./items/weapon";

export default function registerHelpers(): void {
  Handlebars.registerHelper("debug", function () {
    return JSON.stringify(this, null, 2);
  });
  Handlebars.registerHelper(
    "stringify",
    function (obj: Record<string, unknown>) {
      return JSON.stringify(obj, null, 2);
    }
  );
  Handlebars.registerHelper("concat", function (a: string, b: string) {
    return a + b;
  });
  Handlebars.registerHelper("plus", function (a: number, b: number) {
    return a + b;
  });
  Handlebars.registerHelper("game", function (prop: string) {
    return game[prop];
  });
  Handlebars.registerHelper("getActor", function (id: string) {
    return game.actors.get(id);
  });
  Handlebars.registerHelper(
    "getActorProp",
    function (id: string, prop: string) {
      if (game.actors.get(id))
        return prop
          .split(".")
          .reduce((acc, elem) => acc[elem], game.actors.get(id));
      else return false;
    }
  );
  Handlebars.registerHelper(
    "filterLength",
    function (a: Array<Record<string, unknown>>, s: string, sub: string) {
      return a.filter((elem) => elem[sub] == s).length;
    }
  );
  Handlebars.registerHelper(
    "reduceNum",
    function (a: Array<Record<string, unknown>>, sub: string) {
      return a.reduce(
        (acc, elem) =>
          acc +
          (sub.split(".").reduce((sAcc, sElem) => sAcc[sElem], elem) as number),
        0
      );
    }
  );
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
      const skillID = weapon.data.data.skill;
      let skillItem = actor.getEmbeddedDocument("Item", skillID) as
        | (Item & { data: { type: "skill" } })
        | undefined;
      if (!skillItem || skillItem.data.type !== "skill") {
        skillItem = undefined;
      }
      console.log({ skillID, skillItem });
      const skillBonus: number =
        forDamage && weapon.data.data.skillBoostsDamage
          ? skillItem?.data.data.rank ?? -1
          : 0;
      const untrainedPenalty = skillBonus === -1 ? -1 : 0;
      const stats = actor.data.data.stats;
      const statsToCheck = [stats[weapon.data.data.stat].mod];
      if (weapon.data.data.secondStat !== "none")
        statsToCheck.push(stats[weapon.data.data.secondStat]?.mod || 0);
      return Math.max(...statsToCheck) + skillBonus + untrainedPenalty;
    }
  );
}
