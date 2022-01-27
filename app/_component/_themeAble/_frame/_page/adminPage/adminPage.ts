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
        ce("test-box")
      )
    )


    

    const contrIsPanInDirIdle = () => {
      const isPanIdle = new Data(false)
      let panIdleTimer = setTimeout(() => {})
      const resetPanIdleTimer = () => {
        console.log("resetTImer")
        isPanIdle.set(false)
        clearTimeout(panIdleTimer)
        panIdleTimer = setTimeout(() => {
          panIdleTimer = setTimeout(() => {
            isPanIdle.set(true)
          }, 100)
        }, 50)
      }

      return {resetPanIdleTimer, isPanIdle}
    }

    const { isPanIdle: isPanXIdle, resetPanIdleTimer: resetPanXIdleTimer } = contrIsPanInDirIdle()
    const { isPanIdle: isPanYIdle, resetPanIdleTimer: resetPanYIdleTimer } = contrIsPanInDirIdle()


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


    const lastAbs = {
      x: 0,
      y: 0
    }

    const lastLastAbs = {
      x: 0,
      y: 0
    }

    const lastHowFarOutOfBounds = {
      x: 0,
      y: 0
    }


    this.body.canvasContainer.on("wheel", (e: WheelEvent) => {
      e.preventDefault();
      if (!e.ctrlKey) {

        lastLastAbs.x = lastAbs.x
        lastLastAbs.y = lastAbs.y

        lastAbs.x = abs.x
        lastAbs.y = abs.y

        

        abs.x -= e.deltaX
        abs.y -= e.deltaY


       
        // slowly make it harder to move when out of bounds
        if (howFarOutOfBounds.x < 0) {
          const impact = (howFarOutOfBounds.x / 70) * -1
          if (e.deltaX < 0) abs.x += impact * e.deltaX
          abs.y += impact * e.deltaY * .75
        }
        else if (howFarOutOfBounds.x > 0) {
          const impact = (howFarOutOfBounds.x / 70)
          if (e.deltaX > 0) abs.x += impact * e.deltaX
          abs.y += impact * e.deltaY * .75
        }
        if (howFarOutOfBounds.y < 0) {
          const impact = (howFarOutOfBounds.y / 70) * -1
          if (e.deltaY < 0) abs.y += impact * e.deltaY
          abs.x += impact * e.deltaX * .75
        }
        else if (howFarOutOfBounds.y > 0) {
          const impact = (howFarOutOfBounds.y / 70)
          if (e.deltaY > 0) abs.y += impact * e.deltaY
          abs.x += impact * e.deltaX * .75
        }

        

        lastHowFarOutOfBounds.x = howFarOutOfBounds.x
        lastHowFarOutOfBounds.y = howFarOutOfBounds.y

        howFarOutOfBounds.x = abs.x > 0 ? -abs.x : abs.x < target.width() - child.width() ? target.width() - child.width() - abs.x : -0
        howFarOutOfBounds.y = abs.y > 0 ? -abs.y : abs.y < target.height() - child.height() ? target.height() - child.height() - abs.y : 0
        



        

        e.stopPropagation()

        if (lastAbs.x - abs.x > .4) {
          if (isPanXIdle.get()) {
            if (lastBoyX !== false && xWasAtIdelOutOfBounds) {
              if (howFarOutOfBounds.x >= 0) abs.x = lastAbs.x
              else resetPanXIdleTimer()
            }
            else {
              if (howFarOutOfBounds.x > 0) abs.x = lastAbs.x
              else resetPanXIdleTimer()
            }
        
            
          }
          else resetPanXIdleTimer()
        }
        else if (lastAbs.x - abs.x < -.4) {
          if (isPanXIdle.get()) {
        
            if (lastBoyX !== true && xWasAtIdelOutOfBounds) {
              if (howFarOutOfBounds.x <= 0) abs.x = lastAbs.x
              else resetPanXIdleTimer()
            }
            else {
              if (howFarOutOfBounds.x < 0) abs.x = lastAbs.x
              else resetPanXIdleTimer()
              
            }
          }
          else resetPanXIdleTimer()
        }


        target.css({
          translateX: abs.x,
          translateY: abs.y
        })

        
      }
    }, true)


    let lastBoyX: boolean = undefined
    let lastBoyY: boolean = undefined


    

    


    const constrFadeBackIntoViewPortAnimationForDir = (dir: "x" | "y") => {
      const translateKey = dir === "x" ? "translateX" : "translateY"
      const cssOb = {}
      cssOb[translateKey] = 0

      const fadeBackIntoViewPortAnimation = animationFrameDelta((delta) => {
        // slowly fade viewport into bounds
        if (howFarOutOfBounds[dir] < 0) abs[dir] -= Math.max(-delta * howFarOutOfBounds[dir] / 7, .4)
        else if (howFarOutOfBounds[dir] > 0) abs[dir] += Math.max(delta * howFarOutOfBounds[dir] / 7, .4)

        howFarOutOfBounds[dir] = abs[dir] > 0 ? -abs[dir] : abs[dir] < target.width() - child.width() ? target.width() - child.width() - abs[dir] : 0
  
        cssOb[translateKey] = abs[dir]
        target.css(cssOb)
  
        
      })

      fadeBackIntoViewPortAnimation.cancel()

      return fadeBackIntoViewPortAnimation
    }



    const xFadeBackIntoView = constrFadeBackIntoViewPortAnimationForDir("x")
    const yFadeBackIntoView = constrFadeBackIntoViewPortAnimationForDir("y")


    let xWasAtIdelOutOfBounds = false
    isPanXIdle.get((idle) => {
      if (idle) {
        console.log("idle x")
        lastBoyX = howFarOutOfBounds.x > 0 ? true : howFarOutOfBounds.x < 0 ? false : undefined
        xWasAtIdelOutOfBounds = howFarOutOfBounds.x !== 0
        xFadeBackIntoView.resume()
      }
      else xFadeBackIntoView.cancel()
    }, false)

    let yWasAtIdelOutOfBounds = false
    isPanYIdle.get((idle) => {
      if (idle) {
        console.log("idle y")
        lastBoyY = howFarOutOfBounds.y > 0 ? true : howFarOutOfBounds.y < 0 ? false : undefined
        yWasAtIdelOutOfBounds = howFarOutOfBounds.y !== 0
        yFadeBackIntoView.resume()
      }
      else yFadeBackIntoView.cancel()
    }, false)





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
