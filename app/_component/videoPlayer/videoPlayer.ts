import Component from "../component"
import declareComponent from "./../../lib/declareComponent"
import Player from "plyr"


export default class VideoPlayer extends Component {

  public player: Player
  constructor() {
    super()

    new MutationObserver((mutations) => {
      const addedNodes = mutations.first.addedNodes
      this.initPlayer(addedNodes[0] as HTMLElement)
    }).observe(this, {
      childList: true,
      subtree: false,
      attributes: false
    })


    this.initPlayer(this.children[0] as HTMLElement)
    
  }

  private initPlayer(node: HTMLElement) {
    this.apd(node)
    this.player = new Player(node, {
      // previewThumbnails: {
      //   src: "./res/img/dist/blueSet@16588800.webp",
      //   enabled: true
      // }
    })
  }


  stl() {
    return require("./plyr.css").toString() + require("./videoPlayer.css").toString()
  }

  pug() {
    return require("./videoPlayer.pug").default + require("./plyr.pug").default
  }

}

declareComponent("video-player", VideoPlayer)