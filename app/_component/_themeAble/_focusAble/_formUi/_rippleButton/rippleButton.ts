import declareComponent from "../../../../../lib/declareComponent";
import FormUi from "../formUi";
import Button from "../../_button/button"
import { PrimElem, Token, VariableLibrary } from "extended-dom";







export default class UiButton extends FormUi<Button> {
  private button: Button

  constructor() {
    const button = new Button()
    super(button)
    this.button = button
    button.focusIndication.set(false)

    this.validMouseButtons = button.validMouseButtons
  }

  public enable: () => void
  public disable: () => void
  public link: ((() => string) & ((to: null) => this) & ((to: string, domainLevel?: number, push?: boolean, notify?: boolean) => this))
  public addActivationCallback: <CB extends (e: MouseEvent | KeyboardEvent | undefined) => void>(cb: CB) => CB
  public removeActivationCallback: <CB extends (e: MouseEvent | KeyboardEvent | undefined) => void>(cb: CB) => CB
  public click: ((<CB extends (e?: MouseEvent | KeyboardEvent) => void>(f: CB) => CB) & ((e?: MouseEvent | KeyboardEvent) => void))
  public hotkey: ((key: string) => void)
  


  set tabIndex(to: number) {
    this.componentBody.tabIndex = to
  }
  get tabIndex(): number {
    return this.componentBody.tabIndex
  }

  public pug(): string {
    return super.pug() + require("./rippleButton.pug").default
  }
  stl() {
    return super.stl() + require("./rippleButton.css").toString()
  }
  
}

for (const f of ["enable", "disable", "link", "addActivationCallback", "removeActivationCallback", "click", "hotkey"]) {
  UiButton.prototype[f] = function (...args: any[]) {
    return this.button[f](...args)
  }
}

declareComponent("ripple-button", UiButton)
