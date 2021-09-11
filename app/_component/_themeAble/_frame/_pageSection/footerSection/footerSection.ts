import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"




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
