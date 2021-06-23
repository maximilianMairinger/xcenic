import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../_icon/lineAccent/lineAccent"
import "../../../_button/_rippleButton/blockButton/blockButton"
import "../../../link/link"
import "../../../_icon/bigVideo/bigVideo"

export default class PhilosophySection extends PageSection {

  constructor() {
    super("light")


  }

  stl() {
    return super.stl() + require("./philosophySection.css").toString()
  }
  pug() {
    return require("./philosophySection.pug").default
  }
}

declareComponent("philosophy-section", PhilosophySection)
