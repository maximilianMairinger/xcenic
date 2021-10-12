import declareComponent from "../../../lib/declareComponent";
import ThemeAble from "../themeAble";

export default class TextArea extends ThemeAble {
  private textarea = this.q("textarea") as HTMLTextAreaElement
  constructor() {
    super(false)
  }
  placeholder(to: string) {
    this.textarea.placeholder = to
  }
  public pug(): string {
    return require("./textArea.pug").default
  }
  stl() {
    return require("./textArea.css").toString()
  }
  
}

declareComponent("textarea", TextArea)
