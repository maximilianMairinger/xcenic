import declareComponent from "../../../../../lib/declareComponent";
import Page from "../page";

import "./../../../../image/image"
import "./../../../textBlob/textBlob"
import "./../../../_button/_rippleButton/blockButton/blockButton"
import BlockButton from  "./../../../_button/_rippleButton/blockButton/blockButton"
import "./../../../_button/_rippleButton/selectButton/selectButton"
import "./../../../_icon/lineAccent/lineAccent"



export default class ContactPage extends Page {
  private lastThingElem = this.q("h3.lastThing")
  private scrollElem = this.q("ui-container-box-scroll") as HTMLElement
  private continueButton = this.q("#continue") as BlockButton

  constructor() {
    super("dark")

    this.resizeData().tunnel((e) => e.width <= 700).get((isMobile) => {
      this.theme.set(isMobile ? "light" : "dark")
    }, false)

    let lastThingAnimSym: Symbol
    this.scrollElem.scrollData().scrollTrigger(50)
      .on("forward", () => {
        let token = lastThingAnimSym = Symbol()
        this.lastThingElem.show().anim({opacity: 1, translateY: .1, scale: 1}, 550)
      })
      .on("backward", () => {
        let token = lastThingAnimSym = Symbol()
        this.lastThingElem.anim({translateY: 5, opacity: 0, scale: .95}, 400).then(() => {if (token === lastThingAnimSym) this.lastThingElem.hide().css({translateY: -20})})
      })


    this.continueButton.addActivationCallback(() => {
      this.scrollElem.scroll(this.scrollElem.scrollHeight-this.scrollElem.height(), {speed: 500})
    })

  }

  pug() {
    return require("./contactPage.pug").default
  }
  
  stl() {
    return require("./contactPage.css").toString()
  }
}

declareComponent("contact-page", ContactPage)
