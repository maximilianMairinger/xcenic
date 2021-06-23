import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "./../../../_icon/lineAccent/lineAccent"
import "./../../../_button/_rippleButton/blockButton/blockButton"
import "./../../../link/link"
import "./../../../_icon/bigVideo/bigVideo"
import "./../../../_icon/landingCircle/landingCircle"

export default class LandingSection extends PageSection {

  constructor() {
    super("light")


  }

  stl() {
    return super.stl() + require("./landingSection.css").toString()
  }
  pug() {
    return require("./landingSection.pug").default
  }
}

declareComponent("landing-section", LandingSection)
