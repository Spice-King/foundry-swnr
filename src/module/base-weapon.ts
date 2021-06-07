import { SWNRBaseWeaponData } from "./types";
import { combineRolls } from "./utils";
import { SWNRBaseItem } from "./base-item";

export class SWNRBaseWeapon<
  D extends SWNRBaseWeaponData
> extends SWNRBaseItem<D> {
  get ammo(): SWNRBaseWeaponData["ammo"] {
    return this.data.data.ammo;
  }

  get canBurstFire(): boolean {
    return this.ammo.type !== "none" && this.ammo.burst && this.ammo.value >= 3;
  }

  get hasAmmo(): boolean {
    return this.ammo.type === "none" || this.ammo.value > 0;
  }

  async rollAttack(
    ab: number,
    damageBonus: number,
    stat: number,
    skillMod: number,
    modifier: number,
    useBurst: boolean
  ): Promise<void> {
    if (!this.actor) {
      const message = `Called rollAttack on item without an actor.`;
      ui.notifications.error(message);
      throw new Error(message);
    }
    if (!this.hasAmmo) {
      ui.notifications.error(`Your ${this.name} is out of ammo!`);
      return;
    }

    console.log({ skillMod, modifier, useBurst, damageBonus });
    const template = "systems/swnr/templates/chat/attack-roll.html";
    const burstFire = useBurst ? 2 : 0;

    // 1d20 + attack bonus (PC plus weapon) + skill mod (-2 if untrained)
    // weapon dice + stat mod + skill if enabled or punch.
    // shock: damage + stat
    // const skill = this.actor.items.filter(w => w.)
    // Burst is +2 To hit and to damage

    const rollData = {
      actor: this.actor.getRollData(),
      weapon: this.data.data,
      hitRoll: <number | undefined>undefined,
      ab,
      stat,
      burstFire,
      modifier,
      damageBonus,
      effectiveSkillRank: skillMod < 0 ? -2 : skillMod,
    };
    console.log(rollData);

    const hitRoll = new Roll(
      "1d20 + @burstFire + @modifier + @ab + @weapon.ab + @stat + @effectiveSkillRank",
      rollData
    ).roll();
    rollData.hitRoll = hitRoll.dice[0].total;
    const damageRoll = new Roll(
      this.data.data.damage + " + @burstFire + @stat + @damageBonus",
      rollData
    ).roll();
    const diceTooltip = {
      hit: await hitRoll.render(),
      damage: await damageRoll.render(),
    };
    const dialogData = {
      actor: this.actor,
      weapon: this,
      hitRoll,
      stat,
      damageRoll,
      burstFire,
      modifier,
      effectiveSkillRank: rollData.effectiveSkillRank,
      diceTooltip,
      ammoRatio: Math.clamped(
        Math.floor((this.data.data.ammo.value * 20) / this.data.data.ammo.max),
        0,
        20
      ),
    };
    const rollMode = game.settings.get("core", "rollMode");
    // const dice = hitRoll.dice.concat(damageRoll.dice)
    // const formula = dice.map(d => (<any>d).formula).join(' + ');
    // const results = dice.reduce((a, b) => a.concat(b.results), [])
    const diceData = combineRolls([hitRoll, damageRoll]);
    if (this.data.data.ammo.type !== "none") {
      const newAmmoTotal = this.data.data.ammo.value - 1 - burstFire;
      await this.update({ "data.ammo.value": newAmmoTotal }, {});
      if (newAmmoTotal === 0)
        ui.notifications.warn(`Your ${this.name} is now out of ammo!`);
    }
    const chatContent = await renderTemplate(template, dialogData);
    // TODO: break up into two rolls and chain them?
    const promise = game.dice3d
      ? game.dice3d.showForRoll(diceData)
      : Promise.resolve();
    promise.then(() => {
      CONFIG.ChatMessage.entityClass.create(
        {
          speaker: ChatMessage.getSpeaker({ actor: this.actor ?? undefined }),
          // roll: roll,
          content: chatContent,
        },
        { rollMode }
      );
    });
  }
}
