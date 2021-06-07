import { SWNRBaseItem } from "./base-item";

declare type SWNRStats = "str" | "dex" | "con" | "int" | "wis" | "cha";
declare interface SWNRStat {
  base: number;
  mod: number;
  bonus: number;
  boost: number;
  total: number;
}
declare type SWNRItemTypes = "";
declare interface SWNRCombatantData {
  health: {
    value: number;
    max: number;
  };
  baseAc: number;
}
declare interface SWNRLiving extends SWNRCombatantData {
  ab: number;
  systemStrain: {
    value: number;
    max: number;
    permanent: number;
  };
  effort: {
    bonus: number;
    current: number;
    scene: number;
    day: number;
    max: number;
    value: number;
  };
}
declare interface SWNREncumbrance {
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
declare interface SWNRCharacterData extends SWNRLiving, SWNREncumbrance {
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
  ac: number;
  level: { value: number };
  stats: { [key in SWNRStats]: SWNRStat };
}

declare interface SWNRDroneData extends SWNRCombatantData {
  model: string;
  operator: string;
  fittings: number;
  speed: number;
  cost: number;
  encumbrance: number;
  range: number;
  tl: number;
  description: string;
  itemTypes: {
    droneWeapon: SWNRBaseItem<SWNRDroneWeaponData>[];
    droneFitting: SWNRBaseItem<SWNRDroneFittingData>[];
  };
}

declare interface SWNRNPCData extends SWNRLiving {
  armorType: "powered" | "combat" | "street" | "primitive";
  skillBonus: number;
  attacks: {
    baseAttack: string;
    damage: string;
    bonusDamage: number;
    number: number;
  };
  saves: number;
  speed: number;
  moralScore: number;
  reaction:
    | "unknown"
    | "hostile"
    | "negative"
    | "neutral"
    | "positive"
    | "friendly";
  homeworld: string;
  faction: string;
  notes: {
    [key in "left" | "right"]: {
      label: string;
      contents: string;
    };
  };
}

declare interface SWNRDecData {
  description: string;
}

declare interface SWNRMinimalItemData extends SWNRDecData {
  cost: number;
  tl: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

declare interface SWNRBaseItemData extends SWNRMinimalItemData {
  encumbrance: number;
}

declare interface SWNRCharacterItemData extends SWNRBaseItemData {
  location: "readied" | "stowed" | "other";
  quality: "stock" | "masterwork" | "makeshift";
}

declare interface SWNRSkillData extends SWNRDecData {
  pool: "ask" | "2d6" | "3d6kh2" | "4d6kh2";
  rank: -1 | 0 | 1 | 2 | 3 | 4;
  defaultStat: "ask" | SWNRStats;
  source: string;
}

declare interface SWNRItemData extends SWNRCharacterItemData {
  quantity: number;
  bundle: {
    bundled: boolean;
    amount: number;
  };
}

declare interface SWNRBaseWeaponData {
  skill: string;
  ab: number;
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

declare interface SWNRWeaponData
  extends SWNRCharacterItemData,
    SWNRBaseWeaponData {
  stat: SWNRStats;
  secondStat: "none" | SWNRStats;
  skillBoostsDamage: boolean;
  shock: {
    dmg: number;
    ac: number;
  };
}

declare interface SWNRArmorData extends SWNRCharacterItemData {
  ac: number;
  shield: boolean;
  use: boolean;
}

declare interface SWNRDroneModelData extends SWNRBaseItemData {
  ac: number;
  fittings: number;
  hp: number;
  range: number;
  speed: number;
}

declare type SWNRDroneFittingData = SWNRMinimalItemData;

declare interface SWNRDroneWeaponData
  extends SWNRBaseItemData,
    SWNRBaseWeaponData {}

declare type SWNRInventoryItemData =
  | SWNRItemData
  | SWNRWeaponData
  | SWNRArmorData;
