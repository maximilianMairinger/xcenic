import RippleButton from "../rippleButton";
import delay from "delay"
import declareComponent from "../../../../../lib/declareComponent";
import { Data } from "josm";

type ReadonlyData<T> = Omit<Data<T>, "set">

export default class SelectButton extends RippleButton {
  private textElem = ce("button-text")
  public selected = new Data(false) as ReadonlyData<boolean>
  public preSelected = new Data(false) as ReadonlyData<boolean>

  constructor(content: string = "", selectedCallback?: (selected: boolean) => void) {
    super();

    if (selectedCallback) this.selected.get(selectedCallback)

    this.preSelected.get((preSelected) => {
      if (preSelected) this.addClass("preSelected")
      else this.removeClass("preSelected")
    })



    this.preActive.set(false)

    this.addActivationCallback(() => {
      (this.selected as Data<boolean>).set(!this.selected.get())
    })


    let nvmCanc = () => {}

    this.initRippleCb = () => {
      (this.preSelected as Data<boolean>).set(!this.preSelected.get())
      let nvm = false
      nvmCanc = () => {
        nvm = true
      }
      return () => {
        if (nvm) return
        (this.preSelected as Data<boolean>).set(!this.preSelected.get())
      }
    }

    this.selected.get((selected) => {
      nvmCanc()
      this.rippleElems.last.fade.auto = false

      if (selected) this.addClass("selected")
      else this.removeClass("selected")

      if (!selected) {
        if (this.fadeRipple.first !== undefined) {
          const myRipples = [this.rippleElems[0], this.rippleElems[1]]
          this.rippleSettled.then(() => {
            myRipples[0].fade(true).then(() => {
              myRipples[1].fade(false)  
            })
          })
        }
          
        
      }
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