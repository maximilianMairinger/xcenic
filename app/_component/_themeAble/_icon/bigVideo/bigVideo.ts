import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";
import "../../../image/image"
import "../../../_themeAble/_focusAble/_button/button"
import Button from "../../../_themeAble/_focusAble/_button/button"
import "../../../_indecator/loadingIndecator/loadingIndicator"
import { Data } from "josm";


export default class BigVideoIcon extends Icon {
  public playingState = new Data<"playing" | "loading" | "paused">("paused")
  constructor() {
    super()

    this.playingState.get((loading) => {
      (this.body.playButton as Button).enabled.set(loading === "paused")

      if (loading === "loading") {
        this.body.loadingBtn.show()
        this.body.playBtn.hide()
        this.body.contentContainer.addClass("loading")
      }
      else if (loading === "paused") {
        this.body.loadingBtn.hide()
        this.body.playBtn.show()
        this.body.contentContainer.removeClass("loading")
      }
      else if (loading === "playing") {
        this.body.loadingBtn.hide()
        this.body.playBtn.hide()
        this.body.contentContainer.removeClass("loading")
      }
    })

  }

  onPlay(cb: () => void) {
    return (this.body.playButton as Button).addActivationCallback(cb)
  }

  

  stl() {
    return super.stl() + require("./bigVideo.css").toString()
  }
  pug() {
    return require("./bigVideo.pug").default
  }
}

declareComponent("big-video", BigVideoIcon);
