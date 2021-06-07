import { SWNRWeaponData } from "../types";
import { SWNRBaseWeapon } from "./../base-weapon";

export class SWNRWeapon extends SWNRBaseWeapon<SWNRWeaponData> {}
export const entity = SWNRWeapon;
export const name = "weapon";

// export type DeepDotKey<T> = {
//   [P in keyof T]: DeepDotKey<T[P]>;
// } &
//   (() => string | number);

// const test = { test: { deep: 34 } };
// export function deepDotKey<T>(prev?: string | number): DeepDotKey<T> {
//   return new Proxy<any>(() => prev, {
//     get: (_, next) => {
//       if (typeof next === "symbol") {
//         throw new Error("Cannot use symbols with deepDotKey.");
//       }
//       return deepDotKey(prev ? `${prev}.${next}` : next);
//     },
//   });
// }

// type PropType<T, Path extends string> =
//     string extends Path ? unknown :(
//     Path extends keyof T ? T[Path] :
//     (Path extends `${infer K}.${infer R}` ? K extends keyof T ? PropType<T[K], R> : unknown :
//     unknown));

// declare function getPropValue<T, P extends string>(obj: T, path: P): PropType<T, P>;
// const testing = getPropValue({test: 43, help: { deep: 5 } }, 'test.deep');
// type StringTest<A extends string, B extends string> = `${A}.${B}`
// type Sane<A> =
// (() => {
//   const test = { test: { deep: 34 }, kds: 3 };
//   type te = Pick<typeof test, 'kds'>;
//   console.log('teve', deepDotKey<typeof test>());
// })();
