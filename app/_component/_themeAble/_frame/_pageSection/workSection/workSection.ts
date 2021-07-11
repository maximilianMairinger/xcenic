import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../textBlob/textBlob"
import "../../../_icon/line/line"
import "../../../_icon/tagAccent/tagAccent"
import "../../../_icon/dotAccent/dotAccent"
import "../../../../image/image"
import "../../../_icon/tgmLogoDots/tgmLogoDots"

export default class PhilosophySection extends PageSection {

  constructor() {
    super("light")


  }

  stl() {
    return super.stl() + require("./workSection.css").toString()
  }
  pug() {
    return require("./workSection.pug").default
  }
}

declareComponent("work-section", PhilosophySection)
