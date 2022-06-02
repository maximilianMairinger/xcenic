import declareComponent from "../../../../../lib/declareComponent"
import Page from "./../page"
import "./../../../../form/form"
import Form from "./../../../../form/form";
import "./../../../textBlob/textBlob"
import "./../../../_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import "./../../../_focusAble/_formUi/_rippleButton/_blockButton/selectButton/selectButton"
import LoadButton from  "./../../../_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import "./../../../_focusAble/_formUi/_editAble/input/input"
import "./../../../_focusAble/_formUi/_editAble/textArea/textArea"
import "./../../../_focusAble/_formUi/formUi"
import "./../../../../image/image"
import Image from "./../../../../image/image"
import qrCode from "qrcode"
import FormUi from "./../../../_focusAble/_formUi/formUi";



class NotFoundPage extends Page {

  constructor() {
    super("light")



    const otpForm = this.q("c-form#otpFactor") as HTMLElement
    const qrCodeUi = otpForm.childs("c-form-ui") as FormUi
    const otpImage = otpForm.childs("c-image") as Image
    const otpPlainText = otpForm.childs("plain-text") as HTMLSpanElement

    qrCodeUi.userFeedbackMode({
      // hover: false,
      // ripple: false,
      // focus
      // active: 
      // enabled

    })

    qrCode.toDataURL("https://google.com", {margin: 0}).then((url) => {
      otpImage.src(url)
    })

    
    otpPlainText.txt("123456")
    
  }


  protected async navigationCallback() {
    
  }

  protected activationCallback(active: boolean): void {
    
  }
  stl() {
    return super.stl() + require("./registrationPage.css").toString()
  }
  pug() {
    return require("./registrationPage.pug").default
  }

}

export default declareComponent("registration-page", NotFoundPage)