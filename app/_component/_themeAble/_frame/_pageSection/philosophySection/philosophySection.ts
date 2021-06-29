import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "./../../../textBlob/textBlob"

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
