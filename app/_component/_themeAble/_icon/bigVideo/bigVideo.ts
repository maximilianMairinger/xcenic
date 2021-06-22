import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default declareComponent("big-video", class BigVideoIcon extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./bigVideo.pug").default
  }
})
