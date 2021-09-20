import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../iconLink/iconLink"
import "../../../_button/_rippleButton/blockButton/blockButton"
import "../../../_icon/speachBubble/speachBubble"
import "../../../_icon/instagramIcon/instagramIcon"
import "../../../_icon/linkedInIcon/linkedInIcon"
import "../../../_icon/sendIcon/sendIcon"
import "../../../_icon/homeIcon/homeIcon"





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
