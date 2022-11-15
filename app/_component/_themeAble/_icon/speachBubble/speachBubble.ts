import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class SpeachBubble extends Icon {
  constructor() {
    super()

  }

  stl() {
    return super.stl() + require("./speachBubble.css").default
  }

  pug() {
    return require("./speachBubble.pug") 
  }
}

declareComponent("speach-bubble", SpeachBubble)