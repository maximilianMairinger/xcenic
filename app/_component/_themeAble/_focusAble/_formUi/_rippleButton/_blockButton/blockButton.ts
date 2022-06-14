import { Data, DataCollection } from "josm";
import keyIndex from "key-index";
import declareComponent from "../../../../../../lib/declareComponent";
import TextComp, { textify } from "../../../../../text/text";
import RippleButton from "../rippleButton";


export default class BlockButton extends RippleButton {
  constructor(content: string = "", onClick?: ((e?: MouseEvent | KeyboardEvent) => any)) {
    super();


    if (onClick) this.click(onClick)
    if (content !== "") this.content(content)


    const allTextElemsNotInEditMode = new Data(true)
    this.allTextEditModeStatus.get((...allTextEditModeStatus) => {
      for (const editMode of allTextEditModeStatus) {
        if (editMode) {
          allTextElemsNotInEditMode.set(false)
          return
        }
      }
      allTextElemsNotInEditMode.set(true)
    })

    
    this.userFeedbackModeCalc.ripple.addMandatoryCondition(allTextElemsNotInEditMode)
    this.userFeedbackModeCalc.hover.addMandatoryCondition(allTextElemsNotInEditMode)
    this.userFeedbackModeCalc.active.addMandatoryCondition(allTextElemsNotInEditMode)

    
    this.mutObs = new MutationObserver((records) => {
      this.changeChilds()
    })
    this.activateMutationObserver()


    allTextElemsNotInEditMode.get((noEdit) => {
      // no ui changes just dont handle click
      this.button.enabled.set(noEdit)

      if (!noEdit) {
        this.button.css({userSelect: "text"})
      } else {
        this.button.css({userSelect: "none"})
      }

    })
  }
  protected allTextEditModeStatus = new DataCollection()
  private mutObs: MutationObserver

  activateMutationObserver() {
    this.mutObs.observe(this, { attributes: false, childList: true, subtree: false });
  }
  deactivateMutationObserver() {
    this.mutObs.disconnect()
  }

  changeChilds() {
    this.deactivateMutationObserver()

    const editModeDatas = []
    let i = 0;
    for (const child of this.childNodes) {
      if (child instanceof Text) {
        const content = child.textContent
        if (content !== " " && content !== "") {
          const el = this.textElemIndex(i).txt(content)
          editModeDatas.push(el.editMode)
          child.remove()
        }
        i++
      }
      else if (child instanceof Element) i++
    } 

    this.allTextEditModeStatus.set(...editModeDatas)


    this.activateMutationObserver()
  }
  connectedCallback() {
    this.changeChilds()
  }


  protected textElemIndex = keyIndex((index) => {
    const comp = new TextComp()
    let j = 0
    for (const el of this.childNodes) {
      if (el instanceof Text) {
        if (j === index) {
          this.insertBefore(comp, el)
          return comp
        }
        j++
      }
      else if (el instanceof Element) j++
    }
    this.append(comp)
    return comp
  })
  protected get textElem() {
    return this.textElemIndex(0)
  }

  content(to: string | Data<string>) {
    if (to !== "" && to !== " ") this.textElem.txt(to as any)
  }
  stl() {
    return super.stl() + require('./blockButton.css').toString();
  }
  pug() {
    return super.pug() + require("./blockButton.pug").default
  }
}

declareComponent("block-button", BlockButton)