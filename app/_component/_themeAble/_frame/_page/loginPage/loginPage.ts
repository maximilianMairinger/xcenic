import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import "../../../../form/form"
import Form from "../../../../form/form"
import "../../../../_themeAble/_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import Button from "../../../../_themeAble/_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import "../../../../_themeAble/_focusAble/_formUi/_editAble/_input/input"


import adminSession from "../../../../../lib/adminSession"
import delay from "delay"

export default class LoginPage extends Page {

  constructor() {
    super();

    (this.body.form as Form).submitElement(this.body.submit as Button);

    (this.body.form as Form).submit(async (e) => {
      console.log(e)
      
      await delay(1000)
      adminSession.set("hash")
    })

  }



  stl() {
    return super.stl() + require("./loginPage.css").toString()
  }
  pug() {
    return require("./loginPage.pug").default
  }
}
declareComponent("login-page", LoginPage)
