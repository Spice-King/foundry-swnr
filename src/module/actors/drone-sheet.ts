import { SWNRDroneData } from "../types";
import { SWNRDroneActor } from "./drone";
import { SWNRDroneWeapon } from "../items/droneWeapon";
import { ValidatedDialog } from "../ValidatedDialog";

interface DroneActorSheetData extends ActorSheet.Data<SWNRDroneData> {
  itemTypes: { [type: string]: Item[] };
}
interface ItemData {
  name: string;
  type: string;
  data: Record<string, unknown>;
}
export class DroneActorSheet extends ActorSheet<SWNRDroneData, SWNRDroneActor> {
  popUpDialog?: Dialog;

  /** @override */
  _injectHTML(html: JQuery<HTMLElement>, options: unknown): void {
    html
      .find(".window-content")
      .addClass(["cq", "overflow-y-scroll", "relative"]);
    super._injectHTML(html, options);
  }

  /** @override */
  getData(): DroneActorSheetData {
    return {
      ...super.getData(),
      itemTypes: this.actor.itemTypes,
    };
  }
  static get defaultOptions(): FormApplication.Options {
    return mergeObject(super.defaultOptions, {
      classes: ["swnr", "sheet", "actor", "drone"],
      template: "systems/swnr/templates/actors/drone-sheet.html",
      width: 450,
      height: 550,
    });
  }

  /** @override */
  activateListeners(html: JQuery): void {
    super.activateListeners(html);
    html.find(".model-select").on("change", this._onModelChange.bind(this));
    html.find(".item-edit").on("click", this._onItemEdit.bind(this));
    html.find(".item-delete").on("click", this._onItemDelete.bind(this));
    html
      .find(".weapon.item .item-name")
      .on("click", this._onItemDamage.bind(this));
  }

  async _onModelChange(event: JQuery.ChangeEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    const newModel = $(event.currentTarget).val();
    if (newModel != "other") {
      this.popUpDialog?.close();
      this.popUpDialog = new Dialog(
        {
          title: game.i18n.format("swnr.dialog.reconfigureDroneModel", {
            actor: this.actor.name,
          }),
          content: await renderTemplate(
            "systems/swnr/templates/dialogs/reconfigure-drone-model.html",
            {}
          ),
          default: "ok",
          buttons: {
            ok: {
              label: game.i18n.localize("swnr.dialog.ok"),
              callback: async () => {
                switch (newModel) {
                  case "primitiveDrone":
                    await this.actor.update({
                      data: {
                        health: { value: 1, max: 1 },
                        baseAc: 12,
                        model: "primitiveDrone",
                        fittings: 1,
                        speed: 30,
                        cost: 250,
                        encumbrance: 2,
                        range: 0.5,
                        tl: 3,
                        description: game.i18n.localize(
                          "swnr.drone.model.primitiveDrone.text"
                        ),
                      },
                    });
                    break;
                  case "voidHawk":
                    await this.actor.update({
                      data: {
                        health: { value: 15, max: 15 },
                        baseAc: 14,
                        model: "voidHawk",
                        fittings: 4,
                        speed: 30,
                        cost: 5000,
                        encumbrance: 6,
                        range: 100,
                        tl: 4,
                        description: game.i18n.localize(
                          "swnr.drone.model.voidHawk.text"
                        ),
                      },
                    });
                    break;
                  case "stalker":
                    await this.actor.update({
                      data: {
                        health: { value: 5, max: 5 },
                        baseAc: 13,
                        model: "stalker",
                        fittings: 3,
                        speed: 30,
                        cost: 1000,
                        encumbrance: 2,
                        range: 2,
                        tl: 4,
                        description: game.i18n.localize(
                          "swnr.drone.model.stalker.text"
                        ),
                      },
                    });
                    break;
                  case "cuttlefish":
                    await this.actor.update({
                      data: {
                        health: { value: 10, max: 10 },
                        baseAc: 13,
                        model: "cuttlefish",
                        fittings: 5,
                        speed: 30,
                        cost: 2000,
                        encumbrance: 2,
                        range: 1,
                        tl: 4,
                        description: game.i18n.localize(
                          "swnr.drone.model.cuttlefish.text"
                        ),
                      },
                    });
                    break;
                  case "ghostwalker":
                    await this.actor.update({
                      data: {
                        health: { value: 1, max: 1 },
                        baseAc: 15,
                        model: "ghostwalker",
                        fittings: 2,
                        speed: 30,
                        cost: 3000,
                        encumbrance: 3,
                        range: 5,
                        tl: 4,
                        description: game.i18n.localize(
                          "swnr.drone.model.ghostwalker.text"
                        ),
                      },
                    });
                    break;
                  case "sleeper":
                    await this.actor.update({
                      data: {
                        health: { value: 8, max: 8 },
                        baseAc: 12,
                        model: "sleeper",
                        fittings: 4,
                        speed: 30,
                        cost: 2500,
                        encumbrance: 2,
                        range: 100,
                        tl: 4,
                        description: game.i18n.localize(
                          "swnr.drone.model.sleeper.text"
                        ),
                      },
                    });
                    break;
                  case "pax":
                    await this.actor.update({
                      data: {
                        health: { value: 20, max: 20 },
                        baseAc: 16,
                        model: "pax",
                        fittings: 4,
                        speed: 30,
                        cost: 10000,
                        encumbrance: 4,
                        range: 100,
                        tl: 5,
                        description: game.i18n.localize(
                          "swnr.drone.model.pax.text"
                        ),
                      },
                    });
                    break;
                  case "alecto":
                    await this.actor.update({
                      data: {
                        health: { value: 30, max: 30 },
                        baseAc: 18,
                        model: "alecto",
                        fittings: 4,
                        speed: 30,
                        cost: 50000,
                        encumbrance: 4,
                        range: 5000,
                        tl: 5,
                        description: game.i18n.localize(
                          "swnr.drone.model.alecto.text"
                        ),
                      },
                    });
                    break;
                }
                this.render();
              },
            },
            cancel: {
              label: game.i18n.localize("swnr.dialog.cancel"),
            },
          },
        },
        { classes: ["swnr"] }
      );
      this.popUpDialog.render(true);
    } else {
      await this.actor.update({
        data: {
          model: "other",
        },
      });
      this.render();
    }
  }
  _onItemEdit(event: JQuery.ClickEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const wrapper = $(event.currentTarget).parents(".item");
    const item = this.actor.getOwnedItem(wrapper.data("itemId"));
    item?.sheet.render(true);
  }
  _onItemDelete(event: JQuery.ClickEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const li = $(event.currentTarget).parents(".item");
    li.slideUp(200, () => {
      requestAnimationFrame(() => {
        this.actor.deleteOwnedItem(li.data("itemId"));
      });
    });
  }
  async _onItemDamage(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    const id = event.currentTarget.parentElement.dataset.itemId;
    const weapon = this.actor.getOwnedItem(id);
    if (weapon === null) {
      console.error(`The item ID ${id} does not exist.`);
      return;
    } else if (!(weapon instanceof SWNRDroneWeapon)) {
      console.error(`The item named ${weapon.name} is not a drone weapon.`);
      return;
    }

    const template = await renderTemplate(
      "systems/swnr/templates/dialogs/roll-attack.html",
      {
        actor: this.actor.data,
        weapon,
        skill: weapon.data.data.skill,
        burstFireHasAmmo: weapon.canBurstFire,
      }
    );
    const doRoll = async (html: JQuery<HTMLElement>) => {
      const operator = game.actors.get(this.actor.data.data.operator);
      const stat =
        operator && operator.data.type == "character"
          ? operator.data.data["stats"]["int"]["mod"]
          : 0;
      const skill = (() => {
        if (operator && operator.data.type == "character") {
          const skillVal = operator.getOwnedItem(
            html.find('[name="skill"]').val() as string
          );
          if (skillVal) return skillVal["data"]["data"]["rank"];
        }
        return 0;
      })();
      const modifier = parseInt(html.find('[name="modifier"]').val() as string);
      const burstMode =
        html.find('[name="burstFire"]')?.prop("checked") ?? false;
      const attackBonus = operator ? operator.data.data["ab"] : 2;
      console.log({ stat, skill, modifier, burstMode, attackBonus });

      await weapon.rollAttack(attackBonus, 0, stat, skill, modifier, burstMode);
    };
    this.popUpDialog?.close();
    this.popUpDialog = new ValidatedDialog(
      {
        failCallback: (): void => {
          ui.notifications.error(game.i18n.localize("swnr.roll.skillNeeded"));
        },
        title: game.i18n.format("swnr.dialog.attackRoll", {
          actorName: this.actor.name,
          weaponName: weapon.name,
        }),
        content: template,
        buttons: {
          roll: {
            label: "Roll",
            icon: '<i class="fa fa-dice-d20"></i>',
            callback: doRoll,
          },
        },
      },
      { classes: ["swnr"] }
    );
    this.popUpDialog.render(true);
  }

  /** @override */
  async _updateObject(
    event: Event,
    formData: Record<string, number | string>
  ): Promise<unknown> {
    this._itemEditHandler(formData);
    return super._updateObject(event, formData);
  }
  _itemEditHandler(formData: Record<string, number | string>): void {
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

  /** @override */
  async _onDropItemCreate(itemData: ItemData): Promise<boolean | unknown> {
    // reject all except drone fittings
    if (itemData.type == "droneFitting")
      return super._onDropItemCreate(itemData);
    else if (itemData.type == "weapon")
      return super._onDropItemCreate(
        DroneActorSheet.convertToDroneWeapon(itemData)
      );
    else return false;
  }

  static convertToDroneWeapon(weapon: ItemData): ItemData {
    weapon.type = "droneWeapon";
    weapon.name = weapon.name + " Fitting";
    weapon.data["description"] =
      "A weapon fixed to a drone chassis. " + weapon.data["description"];
    delete weapon.data["location"];
    delete weapon.data["quality"];
    delete weapon.data["stat"];
    delete weapon.data["secondStat"];
    delete weapon.data["skillBoostsDamage"];
    delete weapon.data["shock"];
    return weapon;
  }
}

export const sheet = DroneActorSheet;
export const types = ["drone"];
