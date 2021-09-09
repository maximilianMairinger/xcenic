import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class DesignerWoman extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./designerWoman.pug").default
  }
}

declareComponent("designer-woman", DesignerWoman)