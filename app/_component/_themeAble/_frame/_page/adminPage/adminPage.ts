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
        const zoom = 1 - (e.deltaY / 100)
        abs.z *= zoom

        // keep the zoom around the pointer
        const mouseX = (e.clientX + zoomOffsetTransition.x - abs.x)
        const mouseY = (e.clientY + zoomOffsetTransition.y - abs.y)

        zoomOffsetTransition.x += mouseX * (zoom - 1)
        zoomOffsetTransition.y += mouseY * (zoom - 1)

      }

    }, true)


    const dragMouseButton = 0


    let dragging = false
    let curCoords = {
      x: 0,
      y: 0
    }

    container.on("mousedown", (e: MouseEvent) => {
      if (e.button === dragMouseButton) {
        dragging = true
        curCoords.x = e.clientX
        curCoords.y = e.clientY
        inertiaRender.cancel()
        e.stopPropagation()
        e.preventDefault()
      }
    })

    document.body.on("mouseup", (e: MouseEvent) => {
      if (e.button === dragMouseButton) {
        dragging = false
        inertiaRender.resume()
        e.stopPropagation()
        e.preventDefault()
      }
    })
    window.on("blur", () => {
      dragging = false
    })

    container.on("mousemove", (e: MouseEvent) => {
      if (dragging) {
        delta.x = e.clientX - curCoords.x
        delta.y = e.clientY - curCoords.y

        abs.x += delta.x
        abs.y += delta.y

        curCoords.x = e.clientX
        curCoords.y = e.clientY

        e.stopPropagation()
        e.preventDefault()
      }
    })

    const minMove = .4 / abs.z
    const inertiaRender = animationFrameDelta((timingDelta) => {
      console.log("inertiaRender", delta.x)
      const deltaedMinMove = minMove * timingDelta
      if (Math.abs(delta.x) > deltaedMinMove || Math.abs(delta.y) > deltaedMinMove) {
        delta.x *= 0.955
        delta.y *= 0.955
        abs.x += delta.x * timingDelta
        abs.y += delta.y * timingDelta
      }
      else {
        inertiaRender.cancel()
      }
    })
    inertiaRender.cancel()



    animationFrameDelta(() => {

      let x = abs.x - zoomOffsetTransition.x
      let y = abs.y - zoomOffsetTransition.y
      const z = abs.z

      const w = x - target.width() + child.width() * z
      const h = y - target.height() + child.height() * z
      
      howFarOutOfBounds.x = x > 0 ? -x : w < 0 ? -w : 0
      howFarOutOfBounds.y = y > 0 ? -y : h < 0 ? -h : 0

      if (Math.abs(howFarOutOfBounds.x) > .4) {
        const w = howFarOutOfBounds.x * .4
        x += w
        abs.x += w
      }
      if (Math.abs(howFarOutOfBounds.y) > .4) {
        const w = howFarOutOfBounds.y * .4
        y += w
        abs.y += w
      }


      target.css({
        translateX: x,
        translateY: y,
        scale: z
      })      
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
