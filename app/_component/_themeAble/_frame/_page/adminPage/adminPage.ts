import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import "./../../../../_themeAble/_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import BlockButton from "./../../../../_themeAble/_focusAble/_formUi/_rippleButton/_blockButton/blockButton"




class AdminPage extends Page {
  
  constructor() {
    super();
    

    

  }


  stl() {
    return super.stl() + require("./adminPage.css").toString() + require("rrweb-player/dist/style.css").toString()
  }
  pug() {
    return require("./adminPage.pug").default
  }

}

export default declareComponent("admin-page", AdminPage)