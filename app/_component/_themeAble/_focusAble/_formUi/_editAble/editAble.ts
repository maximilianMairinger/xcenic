import { Data, DataCollection } from "josm";
import FormUi from "../formUi";

export default class EditAble extends FormUi {
  private placeholderElem = this.q("placeholder-text")
  private placeholderCoverGradientElem = this.q("placeholder-gradient")
  protected placeholderUp: Data<boolean>
  constructor(protected inputElem: HTMLInputElement | HTMLTextAreaElement, placeholder = "") {
    super()
    inputElem.id = "editAble"
    this.apd(inputElem as any)

    this.placeholder(placeholder)

    

    const isFocused = new Data(false)
    this.inputElem.on("focus", () => {isFocused.set(true)})
    this.inputElem.on("blur", () => {isFocused.set(false)})

    const isEmpty = new Data(true)
    this.inputElem.on("input", () => {isEmpty.set(this.inputElem.value === "")})

    this.placeholderUp = new Data(false) as any
    new DataCollection(isFocused, isEmpty).get((isFocused, isEmpty) => {
      this.placeholderUp.set(!isEmpty || isFocused)
    })

    
    


    let globalAnimDone: Symbol
    this.placeholderUp.get((up) => {
      

      let localAnimDone = globalAnimDone = Symbol()
      this.componentBody.removeClass("animDone")
      this.placeholderElem.anim(up ? {paddingTop: 7, fontSize: 12} : {paddingTop: 14, fontSize: 14}, 200).then(() => {
        if (localAnimDone === globalAnimDone) this.componentBody.addClass("animDone")
      })
    })

    isEmpty.get((isEmpty) => {
      this.placeholderElem.css({fontWeight: isEmpty ? "normal" : "bold"})
    })

    this.on("click", () => {
      inputElem.focus()
    })
  }
  focus() {
    this.inputElem.focus()
  }
  placeholder(to: string) {
    this.placeholderElem.text(to)
  }
  public pug(): string {
    return super.pug() + require("./editAble.pug").default
  }
  stl() {
    return super.stl() + require("./editAble.css").toString()
  }
  
}

