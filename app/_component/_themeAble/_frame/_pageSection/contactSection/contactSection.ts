import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../link/link"
import "../../../_button/_rippleButton/blockButton/blockButton"
import "../../../_icon/speachBubble/speachBubble"





export default class ContactSection extends PageSection {

  constructor() {
    super("light");



    
  }

  stl() {
    return super.stl() + require("./contactSection.css").toString()
  }
  pug() {
    return require("./contactSection.pug").default
  }
}

declareComponent("contact-section", ContactSection)
