import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "./../../../_icon/lineAccent/lineAccent"
import "./../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import "./../../../_focusAble/_formUi/_rippleButton/rippleButton"
import RippleButton from "./../../../_focusAble/_formUi/_rippleButton/rippleButton"
import "./../../../_focusAble/_button/button"
import Button from "./../../../_focusAble/_button/button"
import "./../../../link/link"
import Link from "./../../../link/link"
import "./../../../_icon/bigVideo/bigVideo"
import ThumbnailElem from "./../../../_icon/bigVideo/bigVideo"
import "./../../../_icon/landingCircle/landingCircle"
import "./../../../textBlob/textBlob"
import { EventListener } from "extended-dom"
import { latestLatent } from "more-proms"
import { Data } from "josm"



require('vidstack/player');
require('vidstack/player/layouts/default');
require('vidstack/player/ui');



export default class LandingSection extends PageSection {
  private coverButton = (this as any).q("view-work .coverButton") as Button
  private rippleButton = this.q("view-work .rippleButton") as RippleButton
  private link = this.q("view-work c-link") as Link
  constructor() {
    super("light")

    new EventListener(this.coverButton, ["mouseover", "focusin"], this.link.mouseOverAnimation)
    new EventListener(this.coverButton, ["mouseleave", "focusout"], this.link.mouseOutAnimation)
    this.coverButton.addActivationCallback(this.link.mouseOutAnimation)
    // this.coverButton.addActivationCallback(this.link.clickAnimation)

    this.coverButton.on("mousedown", () => {
      let release = this.rippleButton.initRipple();
      new EventListener(this.coverButton, ["mouseup", "mouseout"], release, undefined, {once: true})
    });


    


    const playerOpen = new Data(false)

    const thumbnailElem = this.body.thumbnail as ThumbnailElem
    thumbnailElem.onPlay(() => {
      playerOpen.set(true)
    });

    const canLoad = new Promise<void>((res) => {
      (this.body.player as any).addEventListener("can-load", () => {
        res()
      })
    })

    const canPlay = new Promise<void>((res) => {
      (this.body.player as any).addEventListener("can-play", () => {
        res()
      })
    })

    const playing = new Promise<void>((res) => {
      (this.body.player as any).addEventListener("playing", () => {
        res()
      })
    })
    

    // todo set unable to play when hidden. Native play/pause on device (keyboard) can still trigger play even when hidden

    playerOpen.get(latestLatent(async (open: boolean) => {
      const player = this.body.player as any
      if (open) {
        thumbnailElem.playingState.set("loading")
        console.log("can load wait")
        await canLoad
        console.log("can load")
        player.startLoading()
      }
      else {
        player.pause()
      }
      return open
    }).then(async (open) => {
      const player = this.body.player as any
      if (open) {
        console.log("can play wait")
        await canPlay
        console.log("can play")
        player.play()
        console.log("playing wait")
        await playing
        console.log("playing")
      }
      thumbnailElem.playingState.set("playing")
      return open
    }).then(async (open) => {
      const { playerContainer } = this.body
      if (open) {

        const f = () => {
          k1.deactivate()
          k2.deactivate()
          k3.deactivate()
          
          playerOpen.set(false)
        }


        const k1 = document.body.on("keydown", ({key}) => {
          if (key === "Escape") f()
        })

        const k2 = this.body.fadeBackground.on("click", f)

        const k3 = this.body.playerContainer.on("wheel", f)

        playerContainer.css({display: "flex"});
        await playerContainer.anim({opacity: 1})
      }
      else {
        thumbnailElem.playingState.set("paused")
        await playerContainer.anim({opacity: 0})
      }
      return open
    }).then((open) => {
      const { playerContainer } = this.body
      if (!open) {
        playerContainer.css({display: "none"});
      }
    }))

    // playerOpen.get((open) => {
    //   if (open) {
    //     (this.body.player as any).play()
    //   }
    //   else {
    //     (this.body.player as any).pause()
    //   }
      
    // })


    
  }

  stl() {
    return super.stl() + require('vidstack/player/styles/default/theme.css').toString() + require('vidstack/player/styles/default/layouts/video.css').toString() + require("./landingSection.css").toString()
  }
  pug() {
    return require("./landingSection.pug").default
  }
}

declareComponent("landing-section", LandingSection)
