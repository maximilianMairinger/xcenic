import { ScrollData } from "extended-dom";
import { Data, DataCollection, DataSubscription } from "josm";
import declareComponent from "../../../../../lib/declareComponent";
import Page from "../page";

import "./../../../../image/image"
import "./../../../textBlob/textBlob"
import "./../../../_button/_rippleButton/blockButton/blockButton"
import BlockButton from  "./../../../_button/_rippleButton/blockButton/blockButton"
import "./../../../_button/_rippleButton/selectButton/selectButton"
import "./../../../_icon/lineAccent/lineAccent"



export default class ContactPage extends Page {
  private initialViewElem = this.q("initial-view") as HTMLElement
  private lastThingElem = this.initialViewElem.childs("h3.lastThing")
  
  private continueButton = this.q("#continue") as BlockButton

  constructor() {
    super("dark")

    const isMobile = this.resizeData().tunnel((e) => e.width <= 700)

    isMobile.get((isMobile) => {
      this.theme.set(isMobile ? "light" : "dark")
    })

    let lastThingAnimSym: Symbol

    const scrollData = new ScrollData(0)
    
    const scrollDataSub = new DataSubscription(new Data(0), (scrollPos) => {
      scrollData.set(scrollPos)
    }, true, false)


    const currentScollBody = isMobile.tunnel((isMobile) => isMobile ? this : this.componentBody)

    currentScollBody.get((currentScollBody) => {
      scrollDataSub.data(currentScollBody.scrollData())
    })


    const lastThingShowPos = new Data(50)

    scrollData.scrollTrigger(lastThingShowPos)
      .on("forward", () => {
        let token = lastThingAnimSym = Symbol()
        this.lastThingElem.show().anim({opacity: 1, translateY: .1, scale: 1}, 550)
      })
      .on("backward", () => {
        let token = lastThingAnimSym = Symbol()
        this.lastThingElem.anim({translateY: 5, opacity: 0, scale: .95}, 400).then(() => {if (token === lastThingAnimSym) this.lastThingElem.hide().css({translateY: -20})})
      })


    this.continueButton.addActivationCallback(() => {
      currentScollBody.get().scroll(this.scrollHeight - this.height(), {speed: 500})
    })

  

    const paddingTop = 90
    const marginBottom = 65
    const scrollMargin = 15
    const totalAdd = paddingTop + marginBottom + scrollMargin


    new DataCollection(this.initialViewElem.resizeData() as any as Data<DOMRectReadOnly>, this.resizeData() as any as Data<DOMRectReadOnly>).get((initialView, self) => {
      lastThingShowPos.set((initialView.height + totalAdd) - self.height)
    })
    // .get(({bottom}) => {
    //   lastThingShowPos.set(bottom - 200)
    // })

  }

  pug() {
    return require("./contactPage.pug").default
  }
  
  stl() {
    return super.stl() + require("./contactPage.css").toString()
  }
}

declareComponent("contact-page", ContactPage)
