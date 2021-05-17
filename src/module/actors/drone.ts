import { SWNRDroneData } from "../types";

export class SWNRDroneActor extends Actor<SWNRDroneData> {
  _onCreate(
    data: Parameters<Entity["_onCreate"]>[0],
    options: Parameters<Entity["_onCreate"]>[1],
    userId: string
  ): void {
    super._onCreate(data, options, userId);
    if (data["items"]["length"] || game.userId !== userId) return;
  }

  static makeDroneItem(drone: Actor): Record<string, unknown> {
    return {
      name:
        game.i18n.localize("swnr.drone.drone") + " (" + drone.data.name + ")",
      type: "item",
      data: {
        description: drone.data.data["description"],
        encumbrance: drone.data.data["encumbrance"],
        tl: drone.data.data["tl"],
        cost: drone.data.data["cost"],
      },
      img: "icons/svg/mystery-man.svg",
    };
  }

  static makeDroneControlUnit(drone: Actor): Record<string, unknown> {
    return {
      name:
        game.i18n.localize("swnr.drone.control-unit.name") +
        " (" +
        drone.data.name +
        ")",
      type: "item",
      data: {
        description: game.i18n.localize("swnr.drone.control-unit.text"),
        tl: 3,
      },
      img: "icons/svg/mystery-man.svg",
    };
  }
}

export const entity = SWNRDroneActor;
export const name = "drone";
