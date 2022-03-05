import { Data, DataCollection } from "josm";
import { textify } from "../../../../text/text";
import FormUi from "../formUi";


type ReadonlyData<T> = Omit<Data<T>, "set">

export default class EditAble extends FormUi {

  
  public isEmpty: ReadonlyData<boolean>
  public value: ReadonlyData<string>

  protected placeholderContainer = ce("placeholder-container")
  
  protected placeholderText = textify(ce("placeholder-text"), this)

  protected placeholderUp: Data<boolean>
  constructor(protected inputElem: HTMLInputElement | HTMLTextAreaElement, placeholder = "") {
    super()
    inputElem.id = "editAble"
    this.moveBody.apd(this.placeholderContainer.apd(this.placeholderText))
    this.moveBody.apd(inputElem as any)

    this.userFeedbackMode.ripple.set(false)

    this.placeholder(placeholder)


    const clickListener = this.on("click", () => {
      inputElem.focus()
    })

    const placeholderMoveEnabled = new Data(true)

    new DataCollection(this.enabled, placeholderMoveEnabled).get((enabled, placeholderEnabled) => {
      if (enabled && placeholderEnabled) {
        clickListener.activate()
        this.inputElem.tabIndex = 0
        this.inputElem.css({pointerEvents: "all"} as any)
      } else {
        clickListener.deactivate()
        this.inputElem.tabIndex = -1
        this.inputElem.css({pointerEvents: "none"} as any)
      }
    }, false)

    this.placeholderText.textElement.editMode.get((edit) => {
      placeholderMoveEnabled.set(!edit)
    })

    
    const value = (this as any).value = new Data("")
    this.inputElem.on("input", () => {(this.value as Data<string>).set(this.inputElem.value)})
    const isEmpty = (this as any).isEmpty = value.tunnel((v) => v === "")

    this.placeholderUp = new Data(false) as any
    new DataCollection(this.isFocused as Data<boolean>, isEmpty).get((isFocused, isEmpty) => {
      this.placeholderUp.set(!isEmpty || isFocused)
    })

    
    


    let globalAnimDone: Symbol
    new DataCollection(this.placeholderUp, placeholderMoveEnabled).get((up, enabled) => {
      if (!enabled) return

      let localAnimDone = globalAnimDone = Symbol()
      this.componentBody.removeClass("animDone")
      this.placeholderText.anim(up ? {paddingTop: 7, fontSize: 12} : {paddingTop: 14, fontSize: 14}, 200).then(() => {
        if (localAnimDone === globalAnimDone) this.componentBody.addClass("animDone")
      })
    })

    isEmpty.get((isEmpty) => {
      this.placeholderText.css({fontWeight: isEmpty ? "normal" : "bold"})
    })

  }
  focus() {
    this.inputElem.focus()
  }
  placeholder(to: string) {
    this.placeholderText.text(to)
  }
  public pug(): string {
    return super.pug() + require("./editAble.pug").default
  }
  stl() {
    return super.stl() + require("./editAble.css").toString()
  }
  
}

