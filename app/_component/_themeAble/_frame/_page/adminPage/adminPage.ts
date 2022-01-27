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


    


    const container = this.body.canvasContainer as HTMLElement
    const target = this.body.panArea as HTMLElement
    const child = target.children[0] as HTMLElement


    const abs = {
      x: target.css("translateX") as number,
      y: target.css("translateY") as number,
      z: 1
    }



    const howFarOutOfBounds = {
      x: 0,
      y: 0
    }

    const delta = {
      x: 0,
      y: 0
    }

    const zoomOffsetTransition = {
      x: 0,
      y: 0
    }

    container.on("wheel", (e: WheelEvent) => {
      e.preventDefault();
      if (!e.ctrlKey) {
        // pan
        delta.x = e.deltaX
        delta.y = e.deltaY

        abs.x -= delta.x
        abs.y -= delta.y


        e.stopPropagation()  
      }
      else {
        // zoom
        const zoom = e.deltaY < 0 ? 1.01 : 0.99
        const prevZoom = abs.z - 1
        abs.z = abs.z * zoom

        const zoomDelta = prevZoom - (abs.z - 1)


        // keep the zoom around the pointer
        const mouseX = e.clientX
        const mouseY = e.clientY


        console.log(zoomDelta)
        zoomOffsetTransition.x += mouseX * (-zoomDelta)
        zoomOffsetTransition.y += mouseY * (-zoomDelta)



        console.log(zoomOffsetTransition)




      }

    }, true)



    animationFrameDelta(() => {
      howFarOutOfBounds.x = abs.x > 0 ? -abs.x : abs.x < target.width() - child.width() ? target.width() - child.width() - abs.x : 0
      howFarOutOfBounds.y = abs.y > 0 ? -abs.y : abs.y < target.height() - child.height() ? target.height() - child.height() - abs.y : 0

      if (Math.abs(howFarOutOfBounds.x) > .4) abs.x += howFarOutOfBounds.x * .4
      if (Math.abs(howFarOutOfBounds.y) > .4) abs.y += howFarOutOfBounds.y * .4


      target.css({
        translateX: abs.x - zoomOffsetTransition.x,
        translateY: abs.y - zoomOffsetTransition.y,
        scale: abs.z
      })
      // child.css({
      //   translateX: zoomOffsetTransition.x,
      //   translateY: zoomOffsetTransition.y
      // })
      
    })


    // const pz = new PanZ({
    //   minZoom: .001,
    //   zoomSpeed: .5,
    //   // bounds: 1
    // });
    // pz.init(this.body.zoomArea);


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
