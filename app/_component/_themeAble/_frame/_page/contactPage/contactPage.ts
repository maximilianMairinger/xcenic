import declareComponent from "../../../../../lib/declareComponent";
import Page from "../page";

import "./../../../../image/image"
import "./../../../textBlob/textBlob"
import "./../../../_button/_rippleButton/blockButton/blockButton"
import "./../../../_button/_rippleButton/selectButton/selectButton"
import "./../../../_icon/lineAccent/lineAccent"



export default class ContactPage extends Page {

  constructor() {
    super("dark")

    this.resizeData().tunnel((e) => e.width <= 700).get((isMobile) => {
      this.theme.set(isMobile ? "light" : "dark")
    }, false)
  }

  pug() {
    return require("./contactPage.pug").default
  }
  
  stl() {
    return require("./contactPage.css").toString()
  }
}

declareComponent("contact-page", ContactPage)
