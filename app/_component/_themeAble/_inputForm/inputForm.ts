import declareComponent from "../../../lib/declareComponent";
import ThemeAble from "../themeAble";

export default class InputForm<T extends false | HTMLElement | HTMLAnchorElement = false | HTMLElement> extends ThemeAble<T> {
  public pug(): string {
    return require("./inputForm.pug").default
  }
  stl() {
    return require("./inputForm.css").toString()
  }
  
}
