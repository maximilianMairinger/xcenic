import declareComponent from "../../../lib/declareComponent"
import ThemeAble, { Theme } from "../themeAble";
import "../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import "../_focusAble/_formUi/_editAble/input/input"
import { disableEditableForAllNewOnes, enableEditableForAll, enableEditableForAllNewOnes, getEditableStatus } from "../../text/text";


export default class AdminUi extends ThemeAble {




  constructor() {
    const isEditable = getEditableStatus()
    if (isEditable) disableEditableForAllNewOnes()
    super()
    if (isEditable) enableEditableForAllNewOnes()

  }


  stl() {
    return super.stl() + require("./adminUi.css").toString()
  }
  pug() {
    return require("./adminUi.pug").default
  }
}

declareComponent("admin-ui", AdminUi)
