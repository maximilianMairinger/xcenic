import declareComponent from "../../../lib/declareComponent";
import ThemeAble from "../themeAble";

export default class InputForm extends ThemeAble {
  public pug(): string {
    return require("./inputForm.pug").default
  }
  stl() {
    return require("./inputForm.css").toString()
  }
  
}
