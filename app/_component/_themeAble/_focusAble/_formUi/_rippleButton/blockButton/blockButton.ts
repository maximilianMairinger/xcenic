import RippleButton from "../rippleButton";
import delay from "delay"
import declareComponent from "../../../../../../lib/declareComponent";

const regex = /(?!}).*{/g
function slotifyCss(css) {
  const s = css.match(regex)
  for (const e of s) {
    console.log(e)
  }
}

export default class BlockButton extends RippleButton {
  private textElem = ce("button-text")
  private textContainer = ce("button-container")
  constructor(content: string = "", onClick?: ((e?: MouseEvent | KeyboardEvent) => any)) {
    super();

    if (onClick) this.click(onClick)
    this.content(content);
    this.apd(
      this.textContainer.apd(
        this.textElem
      )
    )

  }


  content(to: string) {
    this.textElem.text(to)
  }
  stl() {
    return super.stl() + require('./blockButton.css').toString();
  }
  pug() {
    return super.pug() + require("./blockButton.pug").default
  }
}

declareComponent("block-button", BlockButton)