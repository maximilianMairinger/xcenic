import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class YoutubeIllustration extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./youtubeIllustration.pug") 
  }
}

declareComponent("youtube-illustration", YoutubeIllustration)