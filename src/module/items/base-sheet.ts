interface EditorOptions {
  target: Record<string, unknown>;
  height: number;
  save_onsavecallback: () => Promise<void>;
}

export class BaseSheet extends ItemSheet {
  static get defaultOptions(): FormApplication.Options {
    return mergeObject(super.defaultOptions, {
      classes: ["swnr", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [],
    });
  }

  _injectHTML(html: JQuery<HTMLElement>, options: unknown): void {
    html
      .find(".window-content")
      .addClass(["cq", "overflow-y-scroll", "relative"]);
    super._injectHTML(html, options);
  }

  _createEditor(
    target: string,
    editorOptions: EditorOptions,
    initialContent: string
  ): void {
    editorOptions.height = Math.max(editorOptions.height, 100);
    TextEditor.create(editorOptions, initialContent).then((mce) => {
      const editor = mce[0];
      editor.focus(false);
      editor.on("change", () => (this.editors[target].changed = true));
    });
  }
  /**
   * @override
   */
  get template(): string {
    return `systems/swnr/templates/items/${this.item.data.type}-sheet.html`;
  }
  getData(): Record<string, unknown> {
    const data = super.getData() as Record<string, unknown>;
    data.actor = this.actor;
    return data;
  }
}
export const sheet = BaseSheet;
export const types = [];
