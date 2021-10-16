import declareComponent from "../../../../lib/declareComponent";
import InputForm from "../inputForm";

export default class Input extends InputForm {
  private input = this.q("input") as HTMLTextAreaElement
  constructor(placeholder: string = "") {
    super(false)

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
