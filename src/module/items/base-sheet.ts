export class BaseSheet extends ItemSheet {
    static get defaultOptions(): FormApplicationOptions {
        return mergeObject(super.defaultOptions, {
            classes: ["swnr", "sheet", "item"],
            width: 520,
            height: 480,
            tabs: []
        })
    }
    /**
     * @override
     */
    get template(): string {
        return `systems/swnr/templates/items/${this.item.data.type}-sheet.html`
    }
    getData() {
        const data = super.getData();
        (<any>data).actor = this.actor;
        return data;
    }
}
export const sheet = BaseSheet
export const types = []
