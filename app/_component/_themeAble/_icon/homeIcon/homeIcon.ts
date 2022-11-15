import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class HomeIcon extends Icon {
  constructor() {
    super()

  }


  pug() {
    return require("./homeIcon.pug") 
  }
}

declareComponent("home-icon", HomeIcon)