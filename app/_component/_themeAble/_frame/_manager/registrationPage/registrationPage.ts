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




class RegisterPage extends Manager {
  private formIndex = {} as {[id: string]: Form}
  showDisplay = "flex"

  constructor() {
    super(null, 1, undefined)

    


    this.innerHTML = require("./setupViews.pug").default


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
  async activationCallback(active: boolean) {
    await super.activationCallback(active)

    if (!active) {
      this.registerIdentifier.set(undefined)
    }
  }
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

  // async tryNavigationCallback(domainFragment: string) {
  //   if (await super.tryNavigationCallback(domainFragment)) {
  //     return this.registerIdentifier.get() !== undefined
  //   }

  //   const splitDomain = domainFragment.split(domain.dirString)
  //   const noRegIdent = this.registerIdentifier.get() === undefined
  //   const registerIdentifier = noRegIdent ? splitDomain.last : this.registerIdentifier.get()
  //   try {
  //     this.registrationInfo = await ajax.get(`/api/register/${registerIdentifier}`)
  //     this.registerIdentifier.set(registerIdentifier)
  //     return true
  //   }
  //   catch(e) {
  //     if (!noRegIdent) {
  //       const registerIdentifier = splitDomain.last
  //       try {
  //         this.registrationInfo = await ajax.get(`/api/register/${registerIdentifier}`)
  //         this.registerIdentifier.set(registerIdentifier)
  //         return true
  //       }
  //       catch(e) {
  //         return false
  //       }
        
  //     }
  //     else return false
  //   }
  // }


  async navigationCallback(to: string) {
    await super.navigationCallback(this.uidFoundInUrl ? "" : to)
    this.insertInitalValues()

    if (this.uidFoundInUrl) domain.set(this.defaultDomain, this.domainLevel, false)

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
    // (this.body.firstName as Input).value.set(this.registrationInfo.firstName);
    // (this.body.surName as Input).value.set(this.registrationInfo.surName);
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
    await delay(300000)
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