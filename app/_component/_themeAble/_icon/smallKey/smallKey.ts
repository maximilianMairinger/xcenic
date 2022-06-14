import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class KeySmallIcon extends Icon {
  pug() {
    return require("./smallKey.pug").default
  }
}

declareComponent("small-key-icon", KeySmallIcon)
