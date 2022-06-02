import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import adminSession from "../../../../../lib/adminSession"


export default class AdminPage extends Page {

  constructor() {
    super()


  }

  protected tryNavigationCallback(domainFragment: string): boolean | void | Promise<boolean | void> {
    return false
    return adminSession.get() !== ""
  }



  stl() {
    return super.stl() + require("./adminPage.css").toString()
  }
  pug() {
    return require("./adminPage.pug").default
  }
}
declareComponent("admin-page", AdminPage)
