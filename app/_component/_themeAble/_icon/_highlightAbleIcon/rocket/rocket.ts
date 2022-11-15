import HighlightAbleIcon from "../highlightAbleIcon";
import declareComponent from "../../../../../lib/declareComponent";

export default class RocketIcon extends HighlightAbleIcon {
  constructor() {
    super()

  }

  pug() {
    return require("./rocket.pug") 
  }
}

declareComponent("rocket-icon", RocketIcon)
