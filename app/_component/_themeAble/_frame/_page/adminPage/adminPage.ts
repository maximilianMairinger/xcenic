import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import adminSession from "../../../../../lib/adminSession"

import ContactPage from "./../contactPage/contactPage"
import { ElementList } from "extended-dom"

import PanZ from "@thesoulfresh/pan-z"


export default class AdminPage extends Page {

  constructor() {
    super()

    this.body.canvas.apd(
      ce("page-frame").apd(
        ce("test-box")
      )
    )


    const target = this.body.panArea
    this.body.canvasContainer.on("wheel", (e: WheelEvent) => {
      e.preventDefault();
      console.log(e.ctrlKey)
      if (!e.ctrlKey) {
        target.css({
          translateX: target.css("translateX") - e.deltaX, 
          translateY: target.css("translateY") - e.deltaY
        })
        e.stopPropagation()
      }
      //   pinchArea.css({
      //     scale: pinchArea.css("scale") * (e.deltaY > 0 ? 0.99 : 1.01)
      //   })

      // } else {
      //   
      // }
    }, true)

    const pz = new PanZ();
    pz.init(this.body.zoomArea);

    



  }

  protected tryNavigationCallback(domainFragment: string): boolean | void | Promise<boolean | void> {
    return adminSession.get() !== ""
  }
  
  // private pageLs: ElementList<Page>
  // public async minimalContentPaint(): Promise<void> {
  //   this.pageLs = this.body.canvas.childs("page-frame > *", true) as ElementList<Page>
  //   await Promise.all([this.pageLs.map((page: Page) => page.minimalContentPaint())])
  //   await super.minimalContentPaint()
  // }

  // public async fullContentPaint(): Promise<void> {
  //   await Promise.all([this.pageLs.map((page: Page) => page.fullContentPaint())])
  //   await super.fullContentPaint()
  // }

  // public async completePaint(): Promise<void> {
  //   await Promise.all([this.pageLs.map((page: Page) => page.completePaint())])
  //   await super.completePaint()
  // }



  stl() {
    return super.stl() + require("./adminPage.css").toString()
  }
  pug() {
    return require("./adminPage.pug").default
  }
}
declareComponent("admin-page", AdminPage)
