import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"

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
