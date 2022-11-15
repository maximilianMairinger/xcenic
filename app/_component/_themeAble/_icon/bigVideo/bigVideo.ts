import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";
import "../../../image/image"



export default declareComponent("big-video", class BigVideoIcon extends Icon {
  constructor() {
    super()

  }
  stl() {
    return super.stl() + require("./bigVideo.css").default
  }
  pug() {
    return require("./bigVideo.pug") 
  }
})
