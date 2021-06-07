import { SWNRDroneData, SWNRDroneModelData } from "../types";
import { SWNRDroneActor } from "./drone";
import { SWNRDroneWeapon } from "../items/droneWeapon";
import { ValidatedDialog } from "../ValidatedDialog";

interface DroneActorSheetData extends ActorSheet.Data<SWNRDroneData> {
  itemTypes: { [type: string]: Item[] };
  modelIndex?: Array<IndexEntry>;
}
interface ItemData {
  _id: string;
  name: string;
  type: string;
  data: Record<string, unknown> | SWNRDroneModelData;
}
interface IndexEntry {
  _id: string;
  name: string;
}
export class DroneActorSheet extends ActorSheet<SWNRDroneData, SWNRDroneActor> {
  popUpDialog?: Dialog;
  modelIndex?: Array<IndexEntry>;

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
      modelIndex: this.modelIndex,
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
    $(this._populateModelIndex.bind(this));
    html.find(".model-select").on("change", this._onModelChange.bind(this));
    html.find(".item-edit").on("click", this._onItemEdit.bind(this));
    html.find(".item-delete").on("click", this._onItemDelete.bind(this));
    html
      .find(".weapon.item .item-name")
      .on("click", this._onItemDamage.bind(this));
  }

  async _populateModelIndex(): Promise<void> {
    if (!this.modelIndex) {
      this.modelIndex = await game.packs.get("swnr.drone-models").getIndex();
      (await game.packs.get("swnr.drone-models").getIndex()).reduceRight(
        (_, indexEntry) =>
          $(".model-select").prepend(
            $("<option>").val(indexEntry._id).text(indexEntry.name)
          ),
        null
      );
      $(".model-select").val(this.actor.data.data.model);
    }
  }

  async _onModelChange(event: JQuery.ChangeEvent): Promise<void | Entity> {
    event.preventDefault();
    event.stopPropagation();
    const newModelId = $(event.currentTarget).val() as string;
    await $(".model-select").val(this.actor.data.data.model);
    if (newModelId != "other") {
      return this._changeModel(newModelId);
    } else {
      return this.actor.update({
        data: {
          model: "other",
        },
      });
    }
  }

  async _changeModel(
    newModelId: string,
    newModelData?: SWNRDroneModelData
  ): Promise<void> {
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
            callback: async () =>
              (async (newModelVals) =>
                this.actor.update({
                  data: {
                    health: { value: newModelVals.hp, max: newModelVals.hp },
                    baseAc: newModelVals.ac,
                    model: newModelId,
                    fittings: newModelVals.fittings,
                    speed: newModelVals.speed,
                    cost: newModelVals.cost,
                    encumbrance: newModelVals.encumbrance,
                    range: newModelVals.range,
                    tl: newModelVals.tl,
                    description: newModelVals.description,
                  },
                }))(
                newModelData
                  ? newModelData
                  : ((
                      await game.packs
                        .get("swnr.drone-models")
                        .getEntry(newModelId)
                    ).data as SWNRDroneModelData)
              ),
          },
          cancel: {
            label: game.i18n.localize("swnr.dialog.cancel"),
          },
        },
      },
      { classes: ["swnr"] }
    );
    this.popUpDialog.render(true);
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
    // reject all except drone models, drone fittings and weapons
    switch (itemData.type) {
      case "droneModel":
        return itemData._id === this.actor.data.data.model
          ? true
          : this._changeModel(
              itemData._id,
              itemData.data as SWNRDroneModelData
            );
      case "droneFitting":
        return super._onDropItemCreate(itemData);
      case "weapon":
        return super._onDropItemCreate(
          DroneActorSheet.convertToDroneWeapon(itemData)
        );
      default:
        return false;
    }
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

  async close(): Promise<void> {
    // drop the local index to the compedium when the sheet is closed so the
    // user can get keys for new entries when the sheet is reopened
    this.modelIndex = undefined;
    super.close();
  }
}

export const sheet = DroneActorSheet;
export const types = ["drone"];
