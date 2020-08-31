export type ButtonData = { label: string, callback: (html: JQuery<HTMLElement>) => void };
interface ValidatedDialogData extends DialogData {
  failCallback: (button: ButtonData) => void;
}

// TODO: fling into upstream TS package
declare class Dialog extends Application {
  static confirm(
    { title, content, yes, no, defaultYes }?: ConfirmDialog,
    options?: ApplicationOptions
  ): Promise<void>;
  constructor(dialogData: DialogData, options?: ApplicationOptions);
  submit(button);
}
type InputElements = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export class ValidatedDialog extends Dialog {
  failCallback: ValidatedDialogData["failCallback"];
  constructor(dialogData: ValidatedDialogData, options?: ApplicationOptions) {
    super(dialogData, options);
    this.failCallback = dialogData.failCallback;
  }
  validate(button: ButtonData): boolean {
    const innerHTML = (<JQuery<HTMLElement>>this.element).find('.window-content').children()
    const elementsToCheck = <InputElements[]>Array.from(innerHTML.find('select,input,textarea'));
    const problems = [];
    const good = elementsToCheck.map(e => {
      const markedRequired = e.getAttribute('required') == null;
      const checkValid = e.checkValidity();
      const blankValue = e.value !== '';
      const elementGood = markedRequired || checkValid && blankValue;
      // TODO: add some basic error messages
      if (elementGood) {
        e.parentElement.classList.remove('failed-validation')
      } else {
        e.parentElement.classList.add('failed-validation')
      }
      return elementGood;
    }).reduce((e, n) => { return e && n });

    return good;
  }
  submit(button: ButtonData): void {
    if (this.validate(button)) {
      return super.submit(button);
    } else {
      this.failCallback(button);
    }
  }
}
