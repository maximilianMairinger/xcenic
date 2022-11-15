import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../textBlob/textBlob"
import "../../../_icon/line/line"
import "../../../_icon/tagAccent/tagAccent"
import "../../../_icon/dotAccent/dotAccent"

export default class LinesSection extends PageSection {

  constructor() {
    super()

  }

  stl() {
    return super.stl() + require("./linesSection.css").default
  }
  pug() {
    return require("./linesSection.pug") 
  }
}

declareComponent("lines-section", LinesSection)
