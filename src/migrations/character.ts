import { registerMigration } from "../migration";
import { SWNRCharacterActor } from "../module/actors/character";

registerMigration(
  SWNRCharacterActor,
  "0.4.2",
  0,
  (char: SWNRCharacterActor, pastUpdates) => {
    if (char.data.data["class"])
      pastUpdates["name"] = char.name + " (" + char.data.data["class"] + ")";
    if (char.data.data["class"] || char.data.data["class"] === "")
      pastUpdates["data.class"] = null;
    if (!char.data.data["effort2"]?.bonus)
      pastUpdates["data.effort2.bonus"] = 0;
    if (!char.data.data["effort2"]?.current)
      pastUpdates["data.effort2.current"] = 0;
    if (!char.data.data["effort2"]?.day) pastUpdates["data.effort2.day"] = 0;
    if (!char.data.data["effort2"]?.scene)
      pastUpdates["data.effort2.scene"] = 0;
    return pastUpdates;
  }
);
