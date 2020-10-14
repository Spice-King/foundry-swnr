export class BaseSheet extends ItemSheet {
    static get defaultOptions(): FormApplicationOptions {
        return mergeObject(super.defaultOptions, {
            classes: ["swnr", "sheet", "item"],
            width: 520,
            height: 480,
            tabs: []
        })
    }
    _createEditor(target, editorOptions, initialContent) : void {
        editorOptions.height = Math.max(editorOptions.height, 100)
        TextEditor.create(editorOptions, initialContent).then(mce => {
            const editor = mce[0];
            editor.focus(false);
            editor.on('change', ev => this.editors[target].changed = true)
        });
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
