import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import adminSession from "../../../../../lib/adminSession"

import ContactPage from "./../contactPage/contactPage"
import { ElementList } from "extended-dom"
import animationFrameDelta, { stats } from "animation-frame-delta"

import PanZ from "@thesoulfresh/pan-z"
import { Data } from "josm"


export default class AdminPage extends Page {

  constructor() {
    super()

    this.body.canvas.apd(
      ce("page-frame").apd(
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box"),
        ce("test-box")
      )
    )


    



    const target = this.body.panArea
    const child = target.children[0]


    const abs = {
      x: target.css("translateX") as number,
      y: target.css("translateY") as number
    }


    const howFarOutOfBounds = {
      x: 0,
      y: 0
    }

    const delta = {
      x: 0,
      y: 0
    }
    this.body.canvasContainer.on("wheel", (e: WheelEvent) => {
      e.preventDefault();
      if (!e.ctrlKey) {
        delta.x = e.deltaX
        delta.y = e.deltaY

        abs.x -= delta.x
        abs.y -= delta.y


        e.stopPropagation()  
      }

    }, true)



    animationFrameDelta(() => {
      howFarOutOfBounds.x = abs.x > 0 ? -abs.x : abs.x < target.width() - child.width() ? target.width() - child.width() - abs.x : 0
      howFarOutOfBounds.y = abs.y > 0 ? -abs.y : abs.y < target.height() - child.height() ? target.height() - child.height() - abs.y : 0

      if (howFarOutOfBounds.x !== 0) abs.x += howFarOutOfBounds.x * .4
      if (howFarOutOfBounds.y !== 0) abs.y += howFarOutOfBounds.y * .4


      target.css({
        translateX: abs.x,
        translateY: abs.y
      })
    })


    const pz = new PanZ({
      minZoom: .5,
      // bounds: 1
    });
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
