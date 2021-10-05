import { SWNRArmorTypes, AllItemClasses, ItemTypes } from "./item-types";

type ActorTypes = "character" | "npc";

declare type SWNRStats = "str" | "dex" | "con" | "int" | "wis" | "cha";

declare interface SWNRStatBase {
  base: number;
  bonus: number;
  boost: number;
}
declare interface SWNRStatComputed {
  mod: number;
  total: number;
}
declare interface SWNRLivingTemplateBase {
  health: {
    value: number;
    max: number;
  };
  baseAc: number; // computed-active effects needed
  ac: number;
  ab: number;
  systemStrain: {
    value: number;
    permanent: number; // computed-active effects needed
  };
  effort: {
    bonus: number;
    current: number;
    scene: number;
    day: number;
  };
}
declare interface SWNRLivingTemplateComputed {
  baseAc: number; // computed-active effects needed
  systemStrain: {
    max: number;
    permanent: number;
  };
  effort: {
    max: number;
    value: number;
  };
}
declare interface SWNREncumbranceTemplateBase {
  encumbrance: {
    [key in "stowed" | "ready"]: { value: number };
  };
}
declare interface SWNREncumbranceTemplateComputed {
  encumbrance: {
    [key in "stowed" | "ready"]: { max: number };
  };
}
declare interface SWNRCharacterBaseData
  extends SWNRLivingTemplateBase,
    SWNREncumbranceTemplateBase {
  level: { value: number; exp: number };
  stats: { [key in SWNRStats]: SWNRStatBase };
  goals: string[];
  class: string;
  species: string;
  homeworld: string;
  background: string;
  employer: string;
  biography: string;
  credits: {
    debt: number;
    balance: number;
    owed: number;
  };
}

declare interface SWNRCharacterComputedData
  extends SWNRLivingTemplateComputed,
    SWNREncumbranceTemplateComputed {
  itemTypes: {
    // todo: make a better type
    [type in Exclude<ItemTypes, "modItem" | "modShip">]: (AllItemClasses & {
      type: type;
    })[];
    // class: SWNRBaseItem<any>[];
    // armor: SWNRBaseItem<"armor">[];
    // weapon: SWNRBaseItem<"weapon">[];
    // background: SWNRBaseItem<any>[];
    // power: SWNRBaseItem<any>[];
    // focus: SWNRBaseItem<any>[];
    // item: SWNRBaseItem<"item">[];
    // modItem: SWNRBaseItem<any>[];
    // modShip: SWNRBaseItem<any>[];
    // skill: SWNRBaseItem<"skill">[];
  };

  save: {
    physical?: number;
    evasion?: number;
    mental?: number;
    luck?: number;
  };
  stats: { [key in SWNRStats]: SWNRStatComputed };
}

declare interface SWNRNPCData extends SWNRLivingTemplateBase {
  armorType: SWNRArmorTypes;
  skillBonus: number;
  attacks: {
    baseAttack: string;
    damage: string;
    bonusDamage: number;
    number: number;
  };
  hitDice: number;
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
interface PCActorSource {
  type: "character";
  data: Merge<SWNRCharacterBaseData, SWNRCharacterComputedData>;
}
declare global {
  interface DataConfig {
    Actor:
      | PCActorSource
      | { type: "npc"; data: Merge<SWNRNPCData, SWNRLivingTemplateComputed> };
  }
  interface SourceConfig {
    Actor:
      | { type: "character"; data: SWNRCharacterBaseData }
      | { type: "npc"; data: SWNRNPCData };
  }
}
