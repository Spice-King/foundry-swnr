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
        },
      ],
    });
  }

  activateListeners(html: JQuery): void {
    super.activateListeners(html);
    html
      .find(".trackedAbilityToggle")
      .on("change", this._onTrackedAbilityToggle.bind(this));
    html.find(".imageSet").on("click", this._onImageSet.bind(this));
    html.find(".classDelete").on("click", this._onClassDelete.bind(this));
  }

  _onTrackedAbilityToggle(event: JQuery.ChangeEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const trackedAbilityField =
      "data." +
      ($(event.currentTarget).hasClass("full") ? "full" : "partial") +
      "ClassData.trackedAbility";
    if ($(event.currentTarget).is(":checked")) {
      this.item.update({ [trackedAbilityField]: "" });
    } else {
      this.item.update({ [trackedAbilityField]: null });
    }
  }

  _onClassDelete(event: JQuery.ClickEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.item.delete();
  }

  async _onImageSet(event: JQuery.ChangeEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    await new FilePicker({
      type: "image",
      callback: (imgPath) => this.item.update({ img: imgPath }),
    } as Application.Options).render();
  }
}

export const sheet = ClassSheet;
export const types = ["class"];
export const isDefault = true;
