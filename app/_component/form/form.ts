import { DataBase, DataBaseSubscription, DataSubscription } from "josm"
import Component from "../component"
import FormUi from "../_themeAble/_focusAble/_formUi/formUi"
import EditAble from "../_themeAble/_focusAble/_formUi/_editAble/editAble"
import SelectButton from "../_themeAble/_focusAble/_formUi/_rippleButton/_blockButton/selectButton/selectButton"
import declareComponent from "./../../lib/declareComponent"
import Button from "./../_themeAble/_focusAble/_formUi/_rippleButton/rippleButton"

type SelectorToButton = string

export default class Form extends Component<false> {
  private dataBase: DataBase<{[key in string]: any}> = new DataBase({})
  private slotElem = ce("slot")
  constructor(submitElement?: SelectorToButton | Button) {
    super(false)
    this.apd(this.slotElem)
    if (submitElement) {
      this.submitElement(submitElement)
    }
  }
  private unsubFromLastSubmitElement = () => {}
  submitElement(submitElement: SelectorToButton | Button) {
    if (typeof submitElement === "string") {
      submitElement = this.childs(submitElement)
    }

    const localUnsub = this.unsubFromLastSubmitElement
    setTimeout(() => {
      if (localUnsub !== this.unsubFromLastSubmitElement) return

      this.unsubFromLastSubmitElement();
      const cb = (submitElement as Button).addActivationCallback(() => {
        this.submit()
      })
      this.unsubFromLastSubmitElement = () => {
        (submitElement as Button).removeActivationCallback(cb)
      }
    })
    


  }

  submit(callback: (...any: any[]) => void): DataBaseSubscription<[{[key in string]: any}]>
  submit(): {[key: string]: any}
  submit(callback?: () => void) {
    if (callback) {
      return this.dataBase(callback, true, false)
    } else {
      const ob = {} as {[key: string]: any}
      let prevWasSelect = false
      let curSelValOb: {[key: string]: any}
      this.childs(Infinity, true).forEach((elem) => {
        if (elem instanceof FormUi) {
          if (elem instanceof SelectButton) {
            if (!prevWasSelect) {
              let name = elem.parent(true).getAttribute("name")
              if (name === null) name = elem.getAttribute("name")
              ob[name] = curSelValOb = {}
            }
            curSelValOb[elem.getAttribute("name")] = elem.selected.get()
            prevWasSelect = true
          }
          else {
            prevWasSelect = false
            if (elem instanceof EditAble) ob[elem.getAttribute("name")] = elem.value.get()
          }
        }
      })

      this.dataBase(ob, true)

      return this.dataBase()
    }
  }


  stl() {
    return ""
  }

  pug() {
    return ""
  }

}

declareComponent("form", Form)