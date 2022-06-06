import { delay } from "tiny-delay"
import declareComponent from "../../../../../lib/declareComponent"
import Page from "./../page"
import "./../../../../form/form"
import Form from "./../../../../form/form";
import "./../../../textBlob/textBlob"
import "./../../../_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import "./../../../_focusAble/_formUi/_rippleButton/_blockButton/selectButton/selectButton"
import LoadButton from  "./../../../_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import "./../../../_focusAble/_formUi/_editAble/_input/input"
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
    const otpPlainText = otpForm.childs("c-text") as HTMLSpanElement


    qrCodeUi.userFeedbackMode({
      preHover: true,
      hover: false,
      focus: false,
      enabled: false,
      ripple: false,
      active: false
    })




    this.getOtpToken().then(({code, url}) => {
      qrCode.toDataURL(url, {
        margin: 0, 
        color: {
          light: '#0000'
        }
      }).then(async (url) => {
        otpImage.src(url)
      })
  
      
      otpPlainText.txt(code)
    })

    
    
  }

  async getOtpToken() {
    await delay(2000)
    return {code: "123456", url: "https://google.com"}
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