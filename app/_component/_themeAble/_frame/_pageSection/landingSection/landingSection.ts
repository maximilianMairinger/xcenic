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
// import HLS from 'hls.js';


require('vidstack/player');
require('vidstack/player/layouts');
require('vidstack/player/ui')

// import { defineCustomElement, MediaQualityRadioGroupElement, MediaSpeedRadioGroupElement } from "vidstack/elements";

// defineCustomElement(MediaQualityRadioGroupElement);
// defineCustomElement(MediaSpeedRadioGroupElement);




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


    
    const player = this.body.player as any

    player.addEventListener('provider-change', (event) => {
      const provider = event.detail;
      if (provider?.type === 'hls') {
        // // Static import
        // provider.library = HLS;
        // Or, dynamic import
        provider.library = () => import(/* webpackChunkName: "hls" */'hls.js');
      }
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
        player.qualities.switch = 'next';        
        // await canLoad
        player.startLoading()
      }
      else {
        player.pause()
      }
      return open
    }).then(async (open) => {
      const player = this.body.player as any
      if (open) {
        await canPlay
        player.play()
        await playing
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
  }

  stl() {
    return super.stl() + require("vidstack/player/styles/default/theme.css").toString() + require("vidstack/player/styles/default/layouts/video.css").toString() + require('./vidPlayer.css').toString() + require("./landingSection.css").toString()
  }
  pug() {
    return require("./landingSection.pug").default
  }
}

declareComponent("landing-section", LandingSection)

const globalStyles = require("vidstack/player/styles/default/theme.css").toString() + require("vidstack/player/styles/default/layouts/video.css").toString() + require('./vidPlayer.css').toString()
document.body.apd(ce("style").addClass("vidstack").html(globalStyles))