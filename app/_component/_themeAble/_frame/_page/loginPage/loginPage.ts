import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import "../../../../form/form"
import Form from "../../../../form/form"
import "../../../../_themeAble/_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import Button from "../../../../_themeAble/_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import "../../../../_themeAble/_focusAble/_formUi/_editAble/input/input"


export default class LoginPage extends Page {

  constructor() {
    super();

    (this.body.form as Form).submitElement(this.body.submit as Button);

    (this.body.form as Form).submit((e) => {
      console.log(e)
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
