import Component from "../component"
import declareComponent from "./../../lib/declareComponent"
import { VmPlayer, VmVideo, VmFile, defineCustomElements } from '@vime/core';

// 1. Manually define them to be as efficient as possible.
// customElements.define('vm-player', VmPlayer);
// customElements.define('vm-video', VmVideo);
// customElements.define('vm-file', VmFile);

// 2. Can't be bothered? Load them all in, may bloat your final bundle size a little.
defineCustomElements();


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