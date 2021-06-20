import Icon from "./../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class XcenicIcon extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./xcenic.pug").default
  }
}

declareComponent("xcenic-icon", XcenicIcon)