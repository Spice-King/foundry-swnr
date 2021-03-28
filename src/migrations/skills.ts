import { registerMigration } from "../migration";
import { SWNRBaseItem } from "../module/base-item";
import { SWNRSkillData } from "../module/types";

type Skill = SWNRBaseItem<SWNRSkillData>;
registerMigration(SWNRBaseItem, "0.4.0", 0, (item: Skill, pastUpdates) => {
  if (item.type === "skill" && item.data.data.source === "psychic")
    pastUpdates["data.source"] = "Psionic";
  return pastUpdates;
});
