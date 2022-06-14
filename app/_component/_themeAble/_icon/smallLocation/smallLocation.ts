import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class SmallLocation extends Icon {
  pug() {
    return require("./smallLocation.pug").default
  }
}

declareComponent("small-location-icon", SmallLocation)
