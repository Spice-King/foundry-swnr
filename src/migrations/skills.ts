import { registerMigration } from "../migration";
import { SWNRBaseItem } from "../module/base-item";
import { SWNRSkillData } from "../module/types";

type Skill = SWNRBaseItem<SWNRSkillData>;
registerMigration(SWNRBaseItem, "0.4.0", 0, (item: Skill, pastUpdates) => {
  if (item.type === "skill" && item.data.data.source === "psychic")
    pastUpdates["data.source"] = "Psionic";
  return pastUpdates;
});

registerMigration(SWNRBaseItem, "0.4.2", 0, (item: Skill, pastUpdates) => {
  if (item.type === "skill" && item.data.data.source === "Psionic") {
    pastUpdates["data.source"] = "Revised";
    pastUpdates["data.psychic"] = true;
  }
  return pastUpdates;
});
