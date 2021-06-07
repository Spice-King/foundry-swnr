import { BaseSheet } from "./base-sheet";

export class ClassSheet extends BaseSheet {
  static get defaultOptions(): FormApplication.Options {
    return mergeObject(super.defaultOptions, {
      width: 750,
      height: 600,
      tabs: [
        {
          navSelector: ".class-sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "full",
        },
      ],
    });
  }
}

export const sheet = ClassSheet;
export const types = ["class"];
export const isDefault = true;
