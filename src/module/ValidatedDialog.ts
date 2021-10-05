export type ButtonData = {
  label: string;
  callback: (html: JQuery<HTMLElement>) => void;
};
interface ValidatedDialogData extends Dialog.Options {
  failCallback: (button: ButtonData) => void;
}

type InputElements = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export class ValidatedDialog extends Dialog<ValidatedDialogData> {
  constructor(
    dialogData: Dialog.Data,
    options: Partial<ValidatedDialogData> | undefined
  ) {
    super(dialogData, options);
  }

  validate(): boolean {
    const innerHTML = (<JQuery<HTMLElement>>this.element)
      .find(".window-content")
      .children();
    const elementsToCheck = <InputElements[]>(
      Array.from(innerHTML.find("select,input,textarea"))
    );
    const good = elementsToCheck
      .map((e) => {
        const markedRequired = e.getAttribute("required") == null;
        const checkValid = e.checkValidity();
        const blankValue = e.value !== "";
        const elementGood = markedRequired || (checkValid && blankValue);
        // TODO: add some basic error messages
        if (elementGood) {
          e.parentElement?.classList.remove("failed-validation");
        } else {
          e.parentElement?.classList.add("failed-validation");
        }
        return elementGood;
      })
      .reduce((e, n) => {
        return e && n;
      });

    return good;
  }

  submit(button: ButtonData): void {
    if (this.validate()) {
      return super.submit(button);
    } else {
      this.options.failCallback?.(button);
    }
  }
}
