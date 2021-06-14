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
    if (char.data.data["ab"]) {
      pastUpdates["data.temporaryAb"] = char.data.data["ab"];
      pastUpdates["data.ab"] = null;
    }
    return pastUpdates;
  }
);
