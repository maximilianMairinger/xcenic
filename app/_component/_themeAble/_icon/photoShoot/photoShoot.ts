import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class PhotoShoot extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./photoShoot.pug") 
  }
}

declareComponent("photo-shoot", PhotoShoot)