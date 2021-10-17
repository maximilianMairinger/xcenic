import declareComponent from "../../../../../lib/declareComponent";
import FormUi from "../formUi";

export default class Input extends FormUi {
  private input = this.q("input") as HTMLTextAreaElement
  constructor(placeholder: string = "") {
    super()

    this.placeholder(placeholder)
  }
  placeholder(to: string) {
    this.input.placeholder = to
  }
  public pug(): string {
    return super.pug() + require("./input.pug").default
  }
  stl() {
    return super.stl() + require("./input.css").toString()
  }
  
}

declareComponent("input2", Input)
