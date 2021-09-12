import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../link/link"
import "../../../_button/_rippleButton/blockButton/blockButton"
import "../../../_icon/speachBubble/speachBubble"





export default class FooterSection extends PageSection {

  constructor() {
    super("light");



    
  }

  stl() {
    return super.stl() + require("./footerSection.css").toString()
  }
  pug() {
    return require("./footerSection.pug").default
  }
}

declareComponent("footer-section", FooterSection)
