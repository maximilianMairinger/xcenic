import declareComponent from "../../../../../lib/declareComponent";
import Page from "../page";

import "./../../../../image/image"
import "./../../../textBlob/textBlob"



export default class ContactPage extends Page {

  constructor() {
    super("dark")
  }

  pug() {
    return require("./contactPage.pug").default
  }
  
  stl() {
    return require("./contactPage.css").toString()
  }
}

declareComponent("contact-page", ContactPage)
