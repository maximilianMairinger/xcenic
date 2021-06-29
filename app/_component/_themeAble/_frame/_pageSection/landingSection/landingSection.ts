import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "./../../../_icon/lineAccent/lineAccent"
import "./../../../_button/_rippleButton/blockButton/blockButton"
import "./../../../_button/_rippleButton/rippleButton"
import RippleButton from "./../../../_button/_rippleButton/rippleButton"
import "./../../../_button/button"
import Button from "./../../../_button/button"
import "./../../../link/link"
import "./../../../_icon/bigVideo/bigVideo"
import "./../../../_icon/landingCircle/landingCircle"
import "./../../../textBlob/textBlob"

export default class LandingSection extends PageSection {

  private coverButton = this.q("view-work .coverButton") as Button
  private rippleButton = this.q("view-work .rippleButton") as RippleButton
  constructor() {
    super("light")

    this.coverButton.on("mousedown", () => {
      let release = this.rippleButton.initRipple();
      this.coverButton.on("mouseup", release)
      this.coverButton.on("mouseout", release)
    })
  }

  stl() {
    return super.stl() + require("./landingSection.css").toString()
  }
  pug() {
    return require("./landingSection.pug").default
  }
}

declareComponent("landing-section", LandingSection)
