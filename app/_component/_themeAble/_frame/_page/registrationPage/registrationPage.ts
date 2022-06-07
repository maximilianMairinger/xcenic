import * as domain from "./../../../../../lib/domain"
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
import { ElementList } from "extended-dom";
import Input from "./../../../_focusAble/_formUi/_editAble/_input/input"
import * as ajax from "../../../../../lib/ajax"



class RegisterPage extends Page {
  private formIndex = {} as {[id: string]: Form}
  constructor() {
    super("light")


    const forms = this.q("c-form") as ElementList<Form>
    this.formIndex = {} as {[id: string]: Form}
    forms.forEach((form) => {
      this.formIndex[form.id] = form as Form
    })

    for (let i = 1; i < forms.length; i++) forms[i].hide()
  }

  private registrationInfo: {
    firstName?: string
    surName?: string
    email?: string
    phone?: string
    username?: string
  }
  private registerIdentifier: string
  async tryNavigationCallback(domainFragment: string) {
    const splitDomain = domainFragment.split(domain.dirString)
    this.registerIdentifier = splitDomain.last
    try {
      this.registrationInfo = await ajax.get(`/api/register/${this.registerIdentifier}`)
      return true
    }
    catch(e) {
      return false
    }
  }

  async navigationCallback() {
    // TODO: remove key from url and keep in local storage
    this.insertInitalValues()

    for (const id in this.formIndex) {
      const form = this.formIndex[id]

      form.submit(async (vals) => {
        try {
          await ajax.post(`/api/registerUpdate/${id}`, vals)
        }
        catch(e) {
          console.error(e)
        }
        // TODO: save progress?
        // TODO: manager?

      })
    }
  }

  insertInitalValues() {
    (this.body.firstName as Input).value.set(this.registrationInfo.firstName);
    (this.body.surName as Input).value.set(this.registrationInfo.surName);
    // TODO
  }




  otpFactor() {
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



  protected activationCallback(active: boolean): void {
    
  }
  stl() {
    return super.stl() + require("./registrationPage.css").toString()
  }
  pug() {
    return require("./registrationPage.pug").default
  }

}

export default declareComponent("registration-page", RegisterPage)