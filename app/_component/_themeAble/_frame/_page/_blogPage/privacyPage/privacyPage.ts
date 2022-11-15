import { declareComponent } from "../../../../../../lib/declareComponent"
import BlogPage from "../blogPage"
import { dirString, domainIndex } from "../../../../../../lib/domain";




export default class PrivacyPage extends BlogPage {

  constructor() {
    super(require("./privacy.pug") )
    
    
  }


}

declareComponent("privacy-page", PrivacyPage)