import { SWNRCharacterActor } from "./character";
import {
  calculateStats,
  combineRolls,
  initSkills,
  limitConcurrency,
} from "../utils";
import { ValidatedDialog } from "../ValidatedDialog";
import {
  SWNRCharacterData,
  SWNRSkillData,
  SWNRWeaponData,
  SWNRStats,
  SWNRStat,
} from "../types";
import { SWNRBaseItem } from "../base-item";

interface CharacterActorSheetData extends ActorSheet.Data<SWNRCharacterData> {
  weapons?: Item[];
  armor?: Item[];
  gear?: Item[];
  skills?: Item[];
  useHomebrewLuckSave: boolean;
  itemTypes: { [type: string]: Item[] };
}
export class CharacterActorSheet extends ActorSheet<
  SWNRCharacterData,
  SWNRCharacterActor
> {
  popUpDialog?: Dialog;
  constructor(...args: unknown[]) {
    super(...args);
  }

  _injectHTML(html: JQuery<HTMLElement>, options: unknown): void {
    html
      .find(".window-content")
      .addClass(["cq", "overflow-y-scroll", "relative"]);
    super._injectHTML(html, options);
  }

  static get defaultOptions(): FormApplication.Options {
    return mergeObject(super.defaultOptions, {
      classes: ["swnr", "sheet", "actor", "character", "test broken"],
      template: "systems/swnr/templates/actors/character-sheet.html",
      width: 750,
      height: 600,
      tabs: [
        {
          navSelector: ".pc-sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "biography",
        },
      ],
    });
  }
  activateListeners(html: JQuery): void {
    super.activateListeners(html);
    html.find(".statRoll").on("click", this._onStatsRoll.bind(this));
    html.find(".skill").on("click", this._onSkillRoll.bind(this));
    html.find(".save").on("click", this._onSaveThrow.bind(this));
    html.find(".item-edit").on("click", this._onItemEdit.bind(this));
    html.find(".item-delete").on("click", this._onItemDelete.bind(this));
    html
      .find(".hp-label")
      .on("click", limitConcurrency(this._onHpRoll.bind(this)));
    html
      .find(".item.weapon .item-name")
      .on("click", this._onWeaponRoll.bind(this));
    html.find(".skill-load-button").on("click", this._onLoadSkills.bind(this));
  }
  async _onLoadSkills(event: JQuery.ClickEvent): Promise<Application> {
    event.preventDefault();
    const _addSkills = async (html: HTMLElement) => {
      const form: HTMLFormElement = html[0].querySelector("form");
      const skillList = <HTMLInputElement>(
        form.querySelector('[name="skillList"]:checked')
      );
      const extra = <HTMLInputElement>(
        form.querySelector("[name=extra]:checked")
      );
      initSkills(this.actor, <"revised" | "classic" | "none">skillList.value);
      initSkills(this.actor, <"spaceMagic" | "psionic" | "none">extra.value);
      return;
    };
    const template = "systems/swnr/templates/dialogs/add-bulk-skills.html";
    const html = await renderTemplate(template, {});
    this.popUpDialog?.close();

    this.popUpDialog = new Dialog(
      {
        title: game.i18n.format("swnr.dialog.add-bulk-skills", {
          actor: this.actor.name,
        }),
        content: html,
        default: "addSkills",
        buttons: {
          addSkills: {
            label: game.i18n.localize("swnr.dialog.add-skills"),
            callback: _addSkills,
          },
        },
      },
      { classes: ["swnr"] }
    );
    return this.popUpDialog.render(true);
  }
  _onItemEdit(event: JQuery.ClickEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const wrapper = $(event.currentTarget).parents(".item");
    const item = this.actor.getOwnedItem(wrapper.data("itemId"));
    item?.sheet.render(true);
  }
  async _onItemDelete(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    const li = $(event.currentTarget).parents(".item");
    const item = this.actor.getOwnedItem(li.data("itemId"));
    if (!item) return;
    const performDelete: boolean = await new Promise((resolve) => {
      Dialog.confirm({
        title: game.i18n.format("swnr.deleteTitle", { name: item.name }),
        yes: () => resolve(true),
        no: () => resolve(false),
        content: game.i18n.format("swnr.deleteContent", {
          name: item.name,
          actor: this.actor.name,
        }),
      });
    });
    if (!performDelete) return;
    li.slideUp(200, () => {
      requestAnimationFrame(() => {
        this.actor.deleteOwnedItem(li.data("itemId"));
      });
    });
  }
  async _onWeaponRoll(
    event: JQuery.ClickEvent<HTMLElement>
  ): Promise<Application | undefined> {
    event.preventDefault();
    const itemId = event.currentTarget.parentElement.dataset.itemId;
    const weapon = <SWNRBaseItem<SWNRWeaponData>>(
      this.actor.getOwnedItem(itemId)
    );
    const ammo = weapon.data.data.ammo;
    const burstFireHasAmmo =
      ammo.type !== "none" && ammo.burst && ammo.value >= 3;
    if (ammo.type !== "none" && ammo.value <= 0) {
      ui.notifications.error(`Your ${weapon.name} is out of ammo!`);
      return;
    }
    const _doRoll = async (html: HTMLFormElement) => {
      const template = "systems/swnr/templates/chat/attack-roll.html";

      const form = <HTMLFormElement>html[0].querySelector("form");
      const modifier = parseInt(
        (<HTMLInputElement>form.querySelector('[name="modifier"]'))?.value
      );
      const burstFire = (<HTMLInputElement>(
        form.querySelector('[name="burstFire"]')
      ))?.checked
        ? 2
        : 0;
      const skillId =
        (<HTMLSelectElement>form.querySelector('[name="skill"]'))?.value ||
        weapon.data.data.skill;
      const skill = this.actor.getOwnedItem(
        skillId
      ) as SWNRBaseItem<SWNRSkillData>;
      const stat = this.actor.data.data.stats[weapon.data.data.stat] || {
        mod: 0,
      };
      // 1d20 + attack bonus (PC plus weapon) + skill mod (-2 if untrained)
      // weapon dice + stat mod + skill if enabled or punch.
      // shock: damage + stat
      // const skill = this.actor.items.filter(w => w.)
      // Burst is +2 To hit and to damage

      const rollData = {
        actor: this.actor.getRollData(),
        weapon: weapon.data.data,
        stat,
        skill: skill,
        hitRoll: <number | undefined>undefined,
        burstFire,
        modifier,
        effectiveSkillRank:
          skill.data.data.rank < 0 ? -2 : skill.data.data.rank,
      };
      const hitRoll = new Roll(
        "1d20 + @burstFire + @modifier + @actor.ab + @weapon.ab + @stat.mod + @effectiveSkillRank",
        rollData
      ).roll();
      rollData.hitRoll = hitRoll.dice[0].total;
      const damageRoll = new Roll(
        weapon.data.data.damage +
          " + @burstFire + @stat.mod" +
          (weapon.data.data.skillBoostsDamage
            ? ` + ${skill.data.data.rank}`
            : ""),
        rollData
      ).roll();
      const diceTooltip = {
        hit: await hitRoll.render(),
        damage: await damageRoll.render(),
      };
      const dialogData = {
        actor: this.actor,
        weapon: weapon,
        skill: skill,
        hitRoll,
        stat,
        damageRoll,
        burstFire,
        modifier,
        effectiveSkillRank: rollData.effectiveSkillRank,
        diceTooltip,
        ammoRatio: Math.clamped(
          Math.floor(
            (weapon.data.data.ammo.value * 20) / weapon.data.data.ammo.max
          ),
          0,
          20
        ),
      };
      const rollMode = game.settings.get("core", "rollMode");
      const diceData = combineRolls([hitRoll, damageRoll]);
      if (weapon.data.data.ammo.type !== "none") {
        const newAmmoTotal = weapon.data.data.ammo.value - 1 - burstFire;
        await weapon.update({ "data.ammo.value": newAmmoTotal }, {});
        if (newAmmoTotal === 0)
          ui.notifications.warn(`Your ${weapon.name} is now out of ammo!`);
      }
      const chatContent = await renderTemplate(template, dialogData);
      // TODO: break up into two rolls and chain them?
      const promise = game.dice3d
        ? game.dice3d.showForRoll(diceData)
        : Promise.resolve();
      promise.then(() => {
        CONFIG.ChatMessage.entityClass.create(
          {
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            // roll: roll,
            content: chatContent,
          },
          { rollMode }
        );
      });
      // return roll;
    };
    const title = game.i18n.format("swnr.dialog.attackRoll", {
      actorName: this.actor.name,
      weaponName: weapon.name,
    });
    const dialogData = {
      actor: this.actor.data,
      weapon: weapon.data.data,
      skills: this.actor.itemTypes.skill,
      stat: this.actor.data.data.stats[weapon.data.data.stat],
      skill: weapon.data.data.skill,
      burstFireHasAmmo,
    };
    const template = "systems/swnr/templates/dialogs/roll-attack.html";
    const html = await renderTemplate(template, dialogData);
    this.popUpDialog?.close();

    this.popUpDialog = new ValidatedDialog(
      {
        failCallback: (): void => {
          ui.notifications.error(game.i18n.localize("swnr.roll.skillNeeded"));
        },
        title: title,
        content: html,
        default: "roll",
        buttons: {
          roll: {
            label: game.i18n.localize("swnr.chat.roll"),
            callback: _doRoll,
          },
        },
      },
      { classes: ["swnr"] }
    );
    return this.popUpDialog.render(true);
  }
  async _onSaveThrow(
    event: JQuery.ClickEvent
  ): Promise<Application | undefined> {
    event.preventDefault();
    console.log(event);
    const e = <HTMLDivElement>event.currentTarget;
    const save = e.dataset.saveType;
    if (!save) return;
    const target = <number>this.actor.data.data.save[save];
    const template = "systems/swnr/templates/dialogs/roll-save.html";
    const title = game.i18n.format("swnr.titles.savingThrow", {
      throwType: game.i18n.localize("swnr.sheet.saves." + save),
    });
    const dialogData = {};
    const html = await renderTemplate(template, dialogData);
    const _doRoll = (html: HTMLFormElement) => {
      console.log(html);
      const rollMode = game.settings.get("core", "rollMode");
      const form = <HTMLFormElement>html[0].querySelector("form");
      const formula = `1d20cs>(@target - @modifier)`;
      const roll = new Roll(formula, {
        modifier: parseInt(
          (<HTMLInputElement>form.querySelector('[name="modifier"]')).value
        ),
        target: target,
      });
      roll.roll();
      console.log(roll.result);
      roll.toMessage(
        {
          speaker: ChatMessage.getSpeaker(),
          flavor: title,
        },
        { rollMode }
      );
      return roll;
    };
    this.popUpDialog?.close();
    this.popUpDialog = new ValidatedDialog(
      {
        failCallback: () => {
          return;
        },
        title: title,
        content: html,
        default: "roll",
        buttons: {
          roll: {
            label: game.i18n.localize("swnr.chat.roll"),
            callback: _doRoll,
          },
        },
      },
      { classes: ["swnr"] }
    );
    return this.popUpDialog.render(true);
  }
  async _onStatsRoll(event: JQuery.ClickEvent): Promise<Application> {
    event.preventDefault();

    const title = `${game.i18n.localize("swnr.chat.statRoll")}: ${
      this.actor.name
    }`;
    const template = "systems/swnr/templates/dialogs/roll-stats.html";
    const dialogData = {
      diceOptions: ["3d6", "4d6kh3"],
    };
    const html = await renderTemplate(template, dialogData);

    const _doRoll = async (html: HTMLFormElement) => {
      console.log(html);
      const rollMode = game.settings.get("core", "rollMode");
      const elements = <HTMLFormElement>html[0].querySelector("form");
      const dice = (<HTMLSelectElement>(
        elements.querySelector('[name="statpool"]')
      )).value;
      const formula = new Array(6).fill(dice).join("+");
      const roll = new Roll(formula);
      roll.roll();
      console.log(roll.result);
      const stats: { [p in SWNRStats]: SWNRStat & { dice: number[] } } = <
        never
      >{};
      ["str", "dex", "con", "int", "wis", "cha"].map((k, i) => {
        stats[k] = {
          dice: roll.dice[i].results,
          base: roll.dice[i].total,
          boost: 0,
          mod: 0,
          bonus: 0,
          total: 0,
        };
      });
      calculateStats(stats);
      const data = {
        actor: this.actor,
        stats,
        totalMod: Object.values(stats).reduce((s, v) => {
          return s + v.mod;
        }, 0),
      };
      const chatContent = await renderTemplate(
        "systems/swnr/templates/chat/stat-block.html",
        data
      );
      // const title = `${game.i18n.localize("swnr.chat.skillCheck")}: ${game.i18n.localize("swnr.stat.short." + (<HTMLSelectElement>elements.querySelector('[name="stat"]')).value)}/${skillName}`
      let promise;
      if (game.dice3d) {
        promise = game.dice3d.showForRoll(roll);
      } else {
        promise = Promise.resolve();
      }
      promise.then(() => {
        CONFIG.ChatMessage.entityClass.create(
          {
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            roll: roll,
            content: chatContent,
          },
          { rollMode }
        );
      });
      return roll;
    };
    this.popUpDialog?.close();
    this.popUpDialog = new ValidatedDialog(
      {
        failCallback: () => {
          return;
        },
        title: title,
        content: html,
        default: "roll",
        buttons: {
          roll: {
            label: game.i18n.localize("swnr.chat.roll"),
            callback: _doRoll,
          },
        },
      },
      { classes: ["swnr"] }
    );
    return this.popUpDialog.render(true);
  }
  async _onHpRoll(event: JQuery.ClickEvent): Promise<Application> {
    event.preventDefault();
    const currentLevel = this.actor.data.data.level.value;
    const rollMode = game.settings.get("core", "rollMode");
    // const lastLevel =
    // currentLevel === 1 ? 0 : this.actor.getFlag("swnr", "lastHpLevel");
    const health = this.actor.data.data.health;
    const currentHp = health.max;
    //todo: sort out health boosts from classes.
    const boosts = 0 * currentLevel;
    const formula = `{${currentLevel}d6 + ${boosts},${currentHp + 1}}kh`;
    const roll = new Roll(formula).roll();
    const newHP = roll.total;
    const data = {
      oldHp: health.max,
      newHp: newHP,
      dice: roll.dice[0].results.map((die: { result: number }) => {
        return {
          roll: die.result,
          classes: [
            die.result === 6 ? "good" : null,
            die.result === 1 ? "bad" : null,
            "die",
          ]
            .filter((c) => c)
            .join(" "),
        };
      }),
    };
    const chatContent = await renderTemplate(
      "systems/swnr/templates/chat/hp-roll.html",
      data
    );
    const promise = game.dice3d
      ? game.dice3d.showForRoll(roll)
      : Promise.resolve();
    promise.then(() => {
      CONFIG.ChatMessage.entityClass.create(
        {
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          roll: roll,
          content: chatContent,
        },
        { rollMode }
      );
      const update = { "data.health.max": newHP };
      if (this.actor.data.data.health.value === currentHp)
        update["data.health.value"] = newHP;
      this.actor.update(update);
    });
    return promise;
  }
  async _onSkillRoll(event: JQuery.ClickEvent): Promise<Application> {
    event.preventDefault();
    console.log(event);
    const target = <HTMLElement>event.currentTarget;
    const dataset = target.dataset;
    const template = "systems/swnr/templates/dialogs/roll-skill.html";
    const skillID = dataset.itemId as string;
    const skill = <SWNRBaseItem<SWNRSkillData>>this.actor.getOwnedItem(skillID);
    const skillData = skill.data.data;
    const skillName = skill.name;
    const title = `${game.i18n.localize("swnr.chat.skillCheck")}: ${skillName}`;
    const dialogData = {
      title: title,
      skillName: skillName,
      skill: skillData,
      data: this.actor.data,
    };
    const html = await renderTemplate(template, dialogData);
    const _doRoll = (html: HTMLFormElement) => {
      console.log(html);
      const rollMode = game.settings.get("core", "rollMode");
      const form = <HTMLFormElement>html[0].querySelector("form");
      const dice = (<HTMLSelectElement>form.querySelector('[name="dicepool"]'))
        .value;
      const stat = this.actor.data.data.stats[
        (<HTMLSelectElement>form.querySelector('[name="stat"]')).value
      ];
      const modifier = (<HTMLInputElement>(
        form.querySelector('[name="modifier"]')
      )).value;
      const formula = `${dice} + @stat + @skill + @modifier`;
      const roll = new Roll(formula, {
        skill: skillData.rank,
        modifier: modifier,
        stat: stat.mod,
      });
      roll.roll();
      console.log(roll.result);
      const title = `${game.i18n.localize(
        "swnr.chat.skillCheck"
      )}: ${game.i18n.localize(
        "swnr.stat.short." +
          (<HTMLSelectElement>form.querySelector('[name="stat"]')).value
      )}/${skillName}`;
      roll.toMessage(
        {
          speaker: ChatMessage.getSpeaker(),
          flavor: title,
        },
        { rollMode }
      );
      return roll;
    };
    this.popUpDialog?.close();
    this.popUpDialog = new ValidatedDialog(
      {
        failCallback: () => {
          return;
        },
        title: title,
        content: html,
        default: "roll",
        buttons: {
          roll: {
            label: game.i18n.localize("swnr.chat.roll"),
            callback: _doRoll,
          },
        },
      },
      {
        classes: ["swnr"],
      }
    );
    return this.popUpDialog.render(true);
  }
  /** @override */
  getData(): CharacterActorSheetData {
    return {
      ...super.getData(),
      useHomebrewLuckSave: !!game.settings.get("swnr", "useHomebrewLuckSave"),
      itemTypes: this.actor.itemTypes,
    };
  }
  /** @override */
  async _updateObject(
    event: Event,
    formData: Record<string, number | string>
  ): Promise<unknown> {
    this._itemEditHandler(formData);
    return super._updateObject(event, formData);
  }
  _itemEditHandler(formData: Record<string, string | number>): void {
    const itemUpdates = {};
    Object.keys(formData)
      .filter((k) => k.startsWith("items."))
      .forEach((k) => {
        const value = formData[k];
        delete formData[k];
        const broken = k.split(".");
        const id = broken[1];
        const update = broken.splice(2).join(".");
        if (!itemUpdates[id]) itemUpdates[id] = { _id: id };
        itemUpdates[id][update] = value;
      });
    for (const key in itemUpdates) {
      if (Object.prototype.hasOwnProperty.call(itemUpdates, key)) {
        const element = itemUpdates[key];
        this.actor.updateEmbeddedEntity("OwnedItem", element);
      }
    }
  }
}
Hooks.on(
  "renderChatMessage",
  (message: ChatMessage, html: JQuery, user: User) => {
    const statApplyButton = <JQuery<HTMLButtonElement>>(
      html.find(".statApplyButton button")
    );
    if (statApplyButton) {
      // fix later
      const actor = game.actors.get(message.data["speaker"]["actor"]);

      if (
        message.getFlag("swnr", "alreadyDone") ||
        (!game.user.isGM && game.user.id === user.id)
      ) {
        statApplyButton.prop("disabled", true);
      } else {
        const bind = function (event: JQuery.ClickEvent) {
          event.preventDefault();
          message.setFlag("swnr", "alreadyDone", true);
          statApplyButton.prop("disabled", true);
          const messageContent = statApplyButton.parents(".message-content");
          const stats = {};
          ["str", "dex", "con", "int", "wis", "cha"].forEach((stat) => {
            stats[stat] = {
              base: parseInt(
                messageContent.find(`.stat-${stat} .statBase`).text()
              ),
            };
          });
          actor.update({ data: { stats } });
        };
        statApplyButton.one("click", bind);
      }
    }
  }
);
export const sheet = CharacterActorSheet;
export const types = ["character"];
