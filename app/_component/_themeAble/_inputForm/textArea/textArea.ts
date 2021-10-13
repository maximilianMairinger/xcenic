import declareComponent from "../../../../lib/declareComponent";
import InputForm from "../inputForm";

export default class TextArea extends InputForm {
  private textarea = this.q("textarea") as HTMLTextAreaElement
  constructor() {
    super(false)
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
