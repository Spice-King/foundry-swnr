import { SWNRBaseActor } from "../base-actor";

export class SWNRNPCActor extends SWNRBaseActor<"npc"> {
  prepareBaseData(): void {
    const e = this.data.data.effort;
    e.value = e.max - e.current - e.scene - e.day;
  }

  // Set the max/value health based on D8 hit dice
  rollHitDice(): void {
    if (this.data.data.hitDice != null && this.data.data.hitDice > 0) {
      const roll = new Roll(`${this.data.data.hitDice}d8`).roll();
      if (roll != undefined && roll.total != undefined) {
        const newHealth = roll.total;
        this.update({
          "data.health.max": newHealth,
          "data.health.value": newHealth,
        });
      }
    }
  }

  _onCreate(
    data: Parameters<SWNRBaseActor["_onCreate"]>[0],
    options: Parameters<SWNRBaseActor["_onCreate"]>[1],
    userId: string
  ): void {
    super._onCreate(data, options, userId);
    if (this.data["items"]["length"] || game.userId !== userId) return;

    this.createEmbeddedDocuments("Item", [
      {
        name: game.i18n.localize("swnr.npc.unarmed"),
        type: "weapon",
        data: {
          ammo: {
            type: "none",
          },
          damage: "d2",
        },
        img: "icons/equipment/hand/gauntlet-armored-leather-grey.webp",
      },
    ]);
  }
}

Hooks.on("createToken", (document, _options, _userId) => {
  if (game.settings.get("swnr", "useRollNPCHD")) {
    if (document.actor?.type == "npc") {
      document.actor.rollHitDice();
    }
  }
});

export const document = SWNRNPCActor;
export const name = "npc";
