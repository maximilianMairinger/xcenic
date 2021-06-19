import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"

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