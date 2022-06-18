import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class SmallIdea extends Icon {
  pug() {
    return require("./smallIdea.pug").default
  }
}

declareComponent("small-idea-icon", SmallIdea)
