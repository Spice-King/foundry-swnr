import { VersionString } from "../migration";
import { SWNRCharacterActor } from "./actors/character";
import { SWNRNPCActor } from "./actors/npc";
import { SWNRBaseItem } from "./base-item";

declare global {
  namespace TextEditor {
    interface Options {
      height: number;
    }
  }
  interface DocumentClassConfig {
    Actor: typeof SWNRCharacterActor | typeof SWNRNPCActor;
    Item: typeof SWNRBaseItem;
  }
  interface LenientGlobalVariableTypes {
    game: true;
  }
  namespace ClientSettings {
    interface Values {
      "swnr.systemMigrationVersion": VersionString;
    }
  }
}
