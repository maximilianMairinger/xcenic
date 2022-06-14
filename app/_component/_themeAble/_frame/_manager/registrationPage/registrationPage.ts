import { Import, PriorityPromise } from "./../../../../../lib/lazyLoad"
import * as domain from "../../../../../lib/domain"
import { delay } from "tiny-delay"
import declareComponent from "../../../../../lib/declareComponent"
import Manager from "../manager"
import "../../../../form/form"
import Form from "../../../../form/form";
import "../../../textBlob/textBlob"
import "../../../_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import "../../../_focusAble/_formUi/_rippleButton/_blockButton/selectButton/selectButton"
import LoadButton from  "../../../_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import "../../../_focusAble/_formUi/_editAble/_input/input"
import "../../../_focusAble/_formUi/_editAble/textArea/textArea"
import "../../../_focusAble/_formUi/formUi"
import "../../../../image/image"
import Image from "../../../../image/image"
import qrCode from "qrcode"
import FormUi from "../../../_focusAble/_formUi/formUi";
import { ElementList } from "extended-dom";
import Input from "../../../_focusAble/_formUi/_editAble/_input/input"
import * as ajax from "../../../../../lib/ajax"
import localSettings from "../../../../../lib/localSettings"
import { Data } from "josm"
import SelectButton from "../../../_focusAble/_formUi/_rippleButton/_blockButton/selectButton/selectButton"
import "../../../_icon/smallKey/smallKey"
import "../../../_icon/smallFingerprint/smallFingerprint"
import "../../../_icon/smallLocation/smallLocation"



class RegisterPage extends Manager {
  private formIndex = {} as {[id: string]: Form}
  showDisplay = "flex"

  constructor() {
    super(null, 1, undefined)

    


    this.innerHTML = require("./setupViews.pug").default
    this.formBody = this.indexElements()



    const forms = this.q("c-form", true) as ElementList<Form>

    const prom = Promise.resolve(forms[0]);
    prom.then((page) => {
      console.log("page", page)
    });
    (prom as any).priorityThen = prom.then
    this.resourcesMap.add("", prom as PriorityPromise)

    this.formIndex = {} as {[id: string]: Form}
    forms.forEach((form) => {
      this.formIndex[form.id] = form as Form
    })

    for (let i = 1; i < forms.length; i++) forms[i].hide()



  }

  private _endPage: string
  endPage(endPage: string) {
    this._endPage = endPage
  }

  connectedCallback() {
    (this as any).defaultDomain = this.resourcesMap.entries().next().value.next().value[0]
  }

  private registrationInfo: {
    firstName?: string
    surName?: string
    email?: string
    phone?: string
    username?: string
  }
  private registerIdentifier = localSettings("registerIdentifier", undefined)

  private uidFoundInUrl = false
  async tryNavigationCallback(domainFragment: string) {
    if (await super.tryNavigationCallback(domainFragment)) {
      if (this.registerIdentifier.get() !== undefined) {
        const registerIdentifier = this.registerIdentifier.get()
        try {
          this.registrationInfo = await ajax.get(`/api/register/${registerIdentifier}`)
          return true
        }
        catch(e) {
          return false
        }
      }
      else return false
    }

    this.uidFoundInUrl = true

    const splitDomain = domainFragment.split(domain.dirString)
    const registerIdentifier = splitDomain.last
    try {
      this.registrationInfo = await ajax.get(`/api/register/${registerIdentifier}`)
      this.registerIdentifier.set(registerIdentifier)
      return true
    }
    catch(e) {
      return false
    }
  }



  async navigationCallback(to: string) {
    await super.navigationCallback(this.uidFoundInUrl ? "" : to)
    this.uidFoundInUrl = false
    this.insertInitalValues()

    if (this.uidFoundInUrl) domain.set(this.defaultDomain, this.domainLevel, false)
  }

  initialActivationCallback() {
    for (const id in this.formIndex) {
      const form = this.formIndex[id]

      form.submit(async (vals) => {
        try {
          await ajax.post(`/api/registerUpdate/${this.registerIdentifier.get()}/${id}`, vals)
        }
        catch(e) {
          console.error(e)
        }

      })
    }

    let linearFormLinks = Object.keys(this.formIndex)
    linearFormLinks = linearFormLinks.slice(0, linearFormLinks.indexOf("pickFactors") + 1)

    for (let i = 0; i < linearFormLinks.length; i++) {
      const link = linearFormLinks[i + 1]
      const form = this.formIndex[linearFormLinks[i]]
      form.submitElement().link(link, this.domainLevel)
    }
    for (const key in this.formIndex) {
      if (this[key]) {
        const ret = this[key]()

        if (ret instanceof Function) {
          (this.formIndex[key] as any).navigate = ret
        }
      }
    }


    const pickFactorsForm = this.formIndex.pickFactors
    const factorButtons = pickFactorsForm.childs("c-select-button", true) as ElementList<SelectButton>
    factorButtons.forEach((button) => {
      const link = button.getAttribute("name")
      if (this.formIndex[link] !== undefined) {
        this.formIndex[link].submitElement().link("pickFactors", this.domainLevel)
        button.selected.get((selected) => {
          setTimeout(() => {
            if (!selected) button.link(link, this.domainLevel)
            else button.link(null)
          })
        })
      }
    })
    
    const doneWithFactorSelectionButton = pickFactorsForm.childs("c-load-button") as LoadButton
    doneWithFactorSelectionButton.link(this._endPage)




  }

  private formBody: {[name: string]: Element | ElementList}

  insertInitalValues() {
    (this.formBody.firstName as Input).value.set(this.registrationInfo.firstName);
    (this.formBody.surName as Input).value.set(this.registrationInfo.surName);
    // TODO
  }




  otpFactor() {
    console.log("OTP")
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

    return () => {
      console.log("OTP2")
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
  }

  async getOtpToken() {
    await delay(2000)
    return {code: "123456", url: "https://google.com"}
  }

  stl() {
    return super.stl() + require("./registrationPage.css").toString()
  }
  pug() {
    return require("./registrationPage.pug").default
  }

}

export default declareComponent("registration-page", RegisterPage)