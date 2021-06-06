import { SWNRCharacterActor } from "./actors/character";
import { SWNRCharacterData } from "./types";

export function calculateStats(stats: SWNRCharacterData["stats"]): void {
  for (const stat of Object.values(stats)) {
    stat.total = stat.base + stat.boost;
    const v = (stat.total - 10.5) / 3.5;
    stat.mod =
      Math.min(2, Math.max(-2, Math[v < 0 ? "ceil" : "floor"](v))) + stat.bonus;
  }
}

export function limitConcurrency<Callback extends (...unknown) => unknown>(
  fn: Callback
): Callback {
  let limited = false;
  return <Callback>async function (...args) {
    if (limited) {
      return;
    }
    limited = true;
    const r = await fn.apply(this, args);
    limited = false;
    return r;
  };
}

/*
Combines an Array of Rolls
*/
export function combineRolls(arr: Roll[]): Roll {
  return arr.reduce((acc, val, ind) => {
    if (ind === 0) {
      return val;
    } else {
      const returnVal = new Roll(`${acc._formula} + ${val._formula}`);

      returnVal.data = {};
      returnVal.results = [...acc.results, "+", ...val.results];
      returnVal.terms = [...acc.terms, "+", ...val.terms];
      returnVal._rolled = true;
      returnVal._total = acc._total + val._total;

      return returnVal;
    }
  });
}

export async function initSkills(
  actor: SWNRCharacterActor,
  skillSet: string
): Promise<void> {
  if (skillSet === "spaceMagic")
    actor.createEmbeddedEntity(
      "OwnedItem",
      ["knowMagic", "useMagic", "sunblade", "fight"].map((element) => {
        const skillRoot = `swnr.skills.${skillSet}.${element}.`;
        return {
          type: "skill",
          name: game.i18n.localize(skillRoot + "name"),
          data: {
            rank: -1,
            pool: "ask",
            description: "",
            source: game.i18n.localize("swnr.skills.labels." + skillSet),
            dice: "2d6",
            psychic: false,
          },
        };
      })
    );
  else if (skillSet !== "none")
    actor.createEmbeddedEntity(
      "OwnedItem",
      await game.packs.get(`swnr.skills-${skillSet}`).getContent()
    );
}
