import { ElementList, ScrollData } from "extended-dom";
import { Data, DataCollection, DataSubscription } from "josm";
import declareComponent from "../../../../../lib/declareComponent";
import Page from "../page"


import "./../../../../form/form"
import "./../../../../image/image"
import "./../../../textBlob/textBlob"
import "./../../../_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import LoadButton from  "./../../../_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import "./../../../_focusAble/_formUi/_rippleButton/_blockButton/selectButton/selectButton"
import "./../../../_icon/lineAccent/lineAccent"
import "./../../../_focusAble/_formUi/_editAble/input/input"
import "./../../../_focusAble/_formUi/_editAble/textArea/textArea"
import Form from "./../../../../form/form";
import lang from "../../../../../lib/lang";
import delay from "delay";



export default class ContactPage extends Page {
  private initialViewElem = this.q("initial-view") as HTMLElement
  private lastThingElem = this.initialViewElem.childs("h3.lastThing")
  
  private continueButton = this.q("#continue") as LoadButton

  private afterInitialViewElem = this.q("after-initial-view") as HTMLElement
  private formElem = this.q("c-form") as Form

  constructor() {
    super("dark")




    this.formElem.submit(async (e) => {
      console.log("now")
      // await delay(2000)
      console.log(e)
      return () => {
        console.log("later")
      }
    })








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
      scrollDataSub.data(currentScollBody.scrollData() as Data<number>)
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

    this.continueButton.content(lang.contact.continue)
    const afterInitViewElemFadeInScrollPos = lastThingShowPos.tunnel(e => e + 50)
    scrollData.scrollTrigger(afterInitViewElemFadeInScrollPos)
      .on("forward", () => {
        this.afterInitialViewElem.anim({opacity: 1, translateY: 20}, 550)
        this.continueButton.content(lang.contact.send)
      })
      .on("backward", () => {
        this.afterInitialViewElem.anim({opacity: 0, translateY: .1}, 400)
        this.continueButton.content(lang.contact.continue)
      });
    
    (() => {
      let first = true
      let lastWidth: number


      const sub = this.continueButton.on("resize", (e: DOMRect) => {
        if (first) {
          first = false
          lastWidth = Math.round(e.width)
          return
        }
        if (Math.round(e.width) === lastWidth) return

        sub.deactivate()
        this.continueButton.anim([{width: lastWidth, maxWidth: lastWidth, offset: 0}, {width: e.width, maxWidth: e.width}]).then(() => {
          this.continueButton.css({width: "unset", maxWidth: "unset"})
          sub.activate()
        })
        
        
        
        lastWidth = Math.round(e.width)
      }, true)
    })();
    

    

    this.afterInitialViewElem.on("focusin", () => {
      if (currentScollBody.get().scrollTop < afterInitViewElemFadeInScrollPos.get()) {
        currentScollBody.get().scroll(currentScollBody.get().scrollHeight - currentScollBody.get().height(), {speed: 500}, false)  
      }
    })


    const afterInitViewInputs = this.afterInitialViewElem.childs(1, true) as ElementList<HTMLElement>
    this.continueButton.click(() => {
      if (currentScollBody.get().scrollTop < afterInitViewElemFadeInScrollPos.get()) {
        afterInitViewInputs.first.focus({preventScroll: true})
      }
      else {
        return this.formElem.submit()
      }
    })

  

    const paddingTop = 90
    const marginBottom = 65
    const scrollMargin = 15
    const totalAdd = paddingTop + marginBottom + scrollMargin


    new DataCollection(this.initialViewElem.resizeData() as any as Data<DOMRectReadOnly>, this.resizeData() as any as Data<DOMRectReadOnly>).get((initialView, self) => {
      lastThingShowPos.set((initialView.height + totalAdd) - self.height)
    })

  }

  pug() {
    return require("./contactPage.pug").default
  }
  
  stl() {
    return super.stl() + require("./contactPage.css").toString()
  }
}

declareComponent("contact-page", ContactPage)
