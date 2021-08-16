import RippleButton from "../rippleButton";
import delay from "delay"
import declareComponent from "../../../../../lib/declareComponent";
import { Data } from "josm";



export default class SelectButton extends RippleButton {
  private textElem = ce("button-text")
  private selected: Data<boolean> = new Data(false) as any

  constructor(content: string = "", selectedCallback?: (selected: boolean) => void) {
    super();

    if (selectedCallback) this.selected.get(selectedCallback)

    this.addActivationCallback(() => {
      this.selected.set(!this.selected.get())
    })

    this.selected.get((selected) => {
      console.log(selected)
      // this.rippleFadeIsOk = !selected
    })
    this.rippleFadeIsOk = false

    this.selected.get((selected) => {
      // if (!selected && this.fadeRipple.first !== undefined) this.fadeRipple.first()
    }, false)

    this.content(content);
    this.apd(this.textElem)
  }

  content(to: string) {
    this.textElem.text(to)
  }

  stl() {
    return super.stl() + require('./selectButton.css').toString();
  }
  pug() {
    return super.pug() + require("./selectButton.pug").default
  }
}

declareComponent("select-button", SelectButton)