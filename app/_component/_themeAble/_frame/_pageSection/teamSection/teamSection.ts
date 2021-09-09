import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../textBlob/textBlob"
import "../../../_button/_rippleButton/blockButton/blockButton"
import "../../../_icon/landingCircle/landingCircle"
import "../../../_icon/quotationMark/quotationMark"


export default class TeamSection extends PageSection {

  constructor() {
    super("light")


  }

  stl() {
    return super.stl() + require("./teamSection.css").toString()
  }
  pug() {
    return require("./teamSection.pug").default
  }
}

declareComponent("team-section", TeamSection)
