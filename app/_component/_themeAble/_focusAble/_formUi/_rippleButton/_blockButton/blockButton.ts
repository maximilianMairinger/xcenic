import { Data } from "josm";
import declareComponent from "../../../../../../lib/declareComponent";
import { textify } from "../../../../../text/text";
import RippleButton from "../rippleButton";


export default class BlockButton extends RippleButton {
  protected textElem = textify(ce("button-text"), this.parentElement as HTMLElement)
  constructor(content: string = "", onClick?: ((e?: MouseEvent | KeyboardEvent) => any)) {
    super();


    if (onClick) this.click(onClick)
    this.content(content);
    this.moveBody.apd(this.textElem)


    this.textElem.textElement.editMode.get((edit) => {
      // no ui changes just dont handle click
      this.button.enabled.set(!edit)
      this.userFeedbackMode.ripple.set(edit ? false : this.ripplePreference()) 

      if (edit) {
        this.button.css({userSelect: "text"})
      } else {
        this.button.css({userSelect: "none"})
      }

    })
  }

  protected ripplePreference(): (typeof this.userFeedbackMode.ripple) extends Data<infer T> ? T : null {
    return false
  }


  content(to: string | Data<string>) {
    this.textElem.text(to as any)
  }
  stl() {
    return super.stl() + require('./blockButton.css').toString();
  }
  pug() {
    return super.pug() + require("./blockButton.pug").default
  }
}

declareComponent("block-button", BlockButton)