import { SWNRBaseItem } from "./items/base";

type SWNRStats = "str" | "dex" | "con" | "int" | "wis" | "cha";
interface SWNRStat {
  base: number;
  mod: number;
  bonus: number;
  boost: number;
  total: number;
}
type SWNRItemTypes = '';
interface SWNRCharacterData {
  health: {
    value: number;
    max: number;
  };
  ac: number;
  baseAc: number;
  ab: number;
  itemTypes: {
    // class: SWNRBaseItem<any>[];
    armor: SWNRBaseItem<SWNRArmorData>[];
    weapon: SWNRBaseItem<SWNRWeaponData>[];
    // background: SWNRBaseItem<any>[];
    // power: SWNRBaseItem<any>[];
    // focus: SWNRBaseItem<any>[];
    item: SWNRBaseItem<SWNRItemData>[];
    // modItem: SWNRBaseItem<any>[];
    // modShip: SWNRBaseItem<any>[];
    skill: SWNRBaseItem<SWNRSkillData>[];
  };
  save: {
    physical?: number;
    evasion?: number;
    mental?: number;
    luck?: number;
  };
  systemStrain: {
    value: number;
    max: number;
    permanent: number;
  };
  level: { value: number };
  stats: { [key in SWNRStats]: SWNRStat };
  effort: {
    bonus: number;
    current: number;
    scene: number;
    day: number;
    max: number;
    value: number;
  };
  encumbrance: {
    stowed: {
      value: number;
      max: number;
    };
    ready: {
      value: number;
      max: number;
    };
  };
}

interface SWNRDecData {
  description: string;
}
interface SWNRBaseItemData extends SWNRDecData{
  encumbrance: number;
  cost: number;
  tl: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  location: "readied" | "stowed" | "other"
  quality: "stock" | "masterwork" | "makeshift";
}
interface SWNRSkillData extends SWNRDecData {
  pool: "ask" | "2d6" | "3d6kh2" | "4d6kh2";
  rank: -1 | 0 | 1 | 2 | 3 | 4;
  defaultStat: "ask" | SWNRStats;
  source: string;
}
interface SWNRItemData extends SWNRBaseItemData {
  quantity: number
  bundle: {
    bundled: boolean
    amount: number
  }
 }
interface SWNRWeaponData extends SWNRBaseItemData {
  stat: SWNRStats;
  secondStat: "none" | SWNRStats;
  skill: "";
  shock: {
    dmg: 0;
    ac: 15;
  };
  ab: 0;
  ammo: {
    longReload: boolean;
    suppress: boolean;
    type: "none" | "typeAPower" | "typeBPower" | "ammo" | "missile" | "special";
    max: number;
    value: number;
    burst: boolean;
  };
  range: {
    normal: number;
    max: number;
  };
  damage: string;
}
interface SWNRArmorData extends SWNRBaseItemData {
  ac: number;
  shield: boolean;
  use: boolean;
}
type SWNRInventoryItemData = SWNRBaseItemData | SWNRWeaponData | SWNRArmorData;
