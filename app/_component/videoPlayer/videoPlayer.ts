import Component from "../component"
import declareComponent from "./../../lib/declareComponent"



export default class VideoPlayer extends Component {


  constructor() {
    super()
  }


  stl() {
    return "" 
  }

  pug() {
    return ""
  }

}

declareComponent("video-player", VideoPlayer)