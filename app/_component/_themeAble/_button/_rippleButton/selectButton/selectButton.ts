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

    this.preActive.get((yes) => {
      if (yes) {
        this.componentBody.removeClass("confirmed")
        this.rippleElems.last.fade.auto = true
      }
    })

    this.addActivationCallback(() => {
      this.selected.set(!this.selected.get())
    })

    

    this.selected.get((selected) => {
      this.rippleElems.last.fade.auto = false
      this.componentBody.addClass("confirmed")

      if (selected) this.addClass("selected")
      else this.removeClass("selected")


      if (!selected && this.fadeRipple.first !== undefined) delay(1000).then(() => {
        this.rippleElems.first.fade(false)
        this.rippleElems.first.fade(false)
      })
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