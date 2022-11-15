import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import adminSession from "../../../../../lib/adminSession"


export default class AdminPage extends Page {

  constructor() {
    super()


  }

  protected tryNavigationCallback(domainFragment: string): boolean | void | Promise<boolean | void> {
    return adminSession.get() !== ""
  }



  stl() {
    return super.stl() + require("./adminPage.css").default
  }
  pug() {
    return require("./adminPage.pug") 
  }
}
declareComponent("admin-page", AdminPage)
