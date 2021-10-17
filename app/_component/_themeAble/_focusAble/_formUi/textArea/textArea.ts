import declareComponent from "../../../../../lib/declareComponent";
import FormUi from "../formUi";

export default class TextArea extends FormUi {
  private textarea = this.q("textarea") as HTMLTextAreaElement
  constructor(placeholder: string = "") {
    super()
    this.placeholder(placeholder)
  }
  placeholder(to: string) {
    this.textarea.placeholder = to
  }
  public pug(): string {
    return super.pug() + require("./textArea.pug").default
  }
  stl() {
    return super.stl() + require("./textArea.css").toString()
  }
  
}

declareComponent("textarea", TextArea)
