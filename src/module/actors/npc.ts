import { SWNRBaseActor } from "../base-actor";

export class SWNRNPCActor extends SWNRBaseActor<"npc"> {
  prepareBaseData(): void {
    const e = this.data.data.effort;
    e.value = e.max - e.current - e.scene - e.day;
  }

  // Set the max/value health based on D8 hit dice
  rollHitDice(): void {
    console.log("rolling NPC hit dice");
    if (this.data.data.hitDice != null) {
      console.log(`Updating health using ${this.data.data.hitDice} hit die `);
      const roll = new Roll(`${this.data.data.hitDice}d8`).roll();
      if (roll != undefined && roll.total != undefined){
        const newHealth = roll.total;
        console.log("Health now = ", roll.result);
        this.update({"data.health.max": newHealth});
        this.update({"data.health.value": newHealth});
      }
    }
    else {
      console.log("NPC has no hit dice, not rolling health");
    }
  }

  _onCreate(
    data: Parameters<SWNRBaseActor["_onCreate"]>[0],
    options: Parameters<SWNRBaseActor["_onCreate"]>[1],
    userId: string
  ): void {
    super._onCreate(data, options, userId);
    if (this.data["items"]["length"] || game.userId !== userId) return;


    this.data.data["hitDice"]=1;
    // Can't figure out how to get this to work: this.actor.update({"data.hitDic": 1});

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
// Unsure of right types for TS here.
Hooks.on("createToken", (document, options, userId) => {
  if (document.actor?.type == "npc") {
    document.actor.rollHitDice();
  }
});


export const document = SWNRNPCActor;
export const name = "npc";
