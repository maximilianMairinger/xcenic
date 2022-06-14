import Component from "../component"
import FormUi from "../_themeAble/_focusAble/_formUi/formUi"
import EditAble from "../_themeAble/_focusAble/_formUi/_editAble/editAble"
import SelectButton from "../_themeAble/_focusAble/_formUi/_rippleButton/_blockButton/selectButton/selectButton"
import declareComponent from "./../../lib/declareComponent"
import GUIButton from "./../_themeAble/_focusAble/_formUi/_rippleButton/rippleButton"
import NButton from "./../_themeAble/_focusAble/_button/button"
import { ElementList } from "extended-dom"
type Button = GUIButton | NButton
type SelectorToButton = string


export default class Form extends Component<false> {
  private slotElem = ce("slot")
  constructor(submitElement?: SelectorToButton | Button) {
    super(false)
    this.apd(this.slotElem)
    if (submitElement) {
      this.submitElement(submitElement)
    }
    else {
      setTimeout(() => {
        if (this.submitElem === undefined) {
          this.panicFindSubmitAndSetButton()
        }
      })
      
    }
  }
  private panicFindSubmitAndSetButton() {
    if (this.submitElementSym !== undefined) return
    const subBut = this.childs("c-block-button, c-button, c-ripple-button, c-block-button, c-load-button", true).last as Button
    if (subBut) this.submitElement(subBut)
  }
  private unsubFromLastSubmitElement = () => {}
  private submitElem: Button
  private submitElementSym: Symbol
  submitElement(submitElement?: SelectorToButton | Button) {
    if (submitElement === undefined) {
      if (this.submitElem === undefined) {
        this.panicFindSubmitAndSetButton()
      }
      return this.submitElem
    }
    
    if (typeof submitElement === "string") {
      submitElement = this.childs(submitElement)
    }

    this.submitElem = submitElement as any

    const localSym = this.submitElementSym = Symbol()
    setTimeout(() => {
      if (localSym !== this.submitElementSym) return

      this.unsubFromLastSubmitElement();
      const cb = (submitElement as Button).addActivationCallback(async () => {
        this.disableChilds(submitElement as Button)
        const res = await this.submit()
        res.push(() => {
          this.enableChilds(submitElement as Button)
        })

        return res
      })
      this.unsubFromLastSubmitElement = () => {
        (submitElement as Button).removeActivationCallback(cb)
      }
    })
    


  }

  public disableChilds(...except: (FormUi | Button)[]) {
    this.getAllFormUiChilds().forEach((e) => {
      if (!except.includes(e)) e.enabled.set(false)
    })
  }
  public enableChilds(...except: (FormUi | Button)[]) {
    this.formUiChildsCache.forEach((e) => {
      if (!except.includes(e)) e.enabled.set(true)
    })
    this.formUiChildsCache = undefined
  }

  private formUiChildsCache: ElementList<FormUi>
  private getAllFormUiChilds() {
    return this.formUiChildsCache = this.childs(Infinity, true).filter(elem => elem instanceof FormUi) as ElementList<FormUi>
  }
  private callbacks: Function[] = []

  submit(callback: (fullData: any) => (Promise<any> | void)): {remove: () => void}
  submit(): Promise<any[]> & {data: {[key: string]: any}}
  submit(callback?: (fullData: any) => (Promise<any> | void)) {
    if (callback) {
      this.callbacks.push(callback)
      return {
        remove: () => {
          this.callbacks.splice(this.callbacks.indexOf(callback), 1)
        }
      }
    } else {
      const ob = {} as {[key: string]: any}
      let prevWasSelect = false
      let curSelValOb: {[key: string]: any}
      (this.formUiChildsCache !== undefined ? this.formUiChildsCache : this.getAllFormUiChilds()).forEach((elem) => {
        if (elem instanceof FormUi) {
          if (elem instanceof SelectButton) {
            if (!prevWasSelect) {
              // @ts-ignore
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


      const prom = Promise.all(this.callbacks.map(cb => cb(ob))) as Promise<any[]> & {data: {[key: string]: any}}
      prom.data = ob

      return prom
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