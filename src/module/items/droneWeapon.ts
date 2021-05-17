import { SWNRDroneWeaponData } from "../types";
import { SWNRBaseWeapon } from "./../base-weapon";

export class SWNRDroneWeapon extends SWNRBaseWeapon<SWNRDroneWeaponData> {}
export const entity = SWNRDroneWeapon;
export const name = "droneWeapon";
