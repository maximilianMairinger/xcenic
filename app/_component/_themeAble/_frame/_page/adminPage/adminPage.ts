import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import adminSession from "../../../../../lib/adminSession"
import localSettings from "./../../../../../lib/localSettings"
import { ElementList } from "extended-dom"
import animationFrameDelta, { ignoreUnsubscriptionError, stats } from "animation-frame-delta"
import Easing from "waapi-easing"
import clone from "fast-copy"
import isIdle from "is-idle"
import LinkedList from "fast-linked-list"



import ContactPage from "./../contactPage/contactPage"
import HomePage from "./../_sectionedPage/_lazySectionedPage/homepage/homepage"
import SectionedPage from "../_sectionedPage/sectionedPage"
import PageFrame, { UrlDuplicateError } from "./pageFrame/pageFrame"
import { Data } from "josm"






const dragMouseButton = 1
const maxZoomStep = 20 // percent
const scrollWheelEasingFunc = (new Easing("easeInOut")).function







function getPlatform() {
  const platform = ((navigator as any).userAgentData !== undefined ? (navigator as any).userAgentData.platform : navigator.platform).toLowerCase() as string
  return platform.includes("win") ? "win" : platform.includes("mac") ? "mac" : platform.includes("linux") ? "linux" : null
}

function getCtrlKey() {
  return getPlatform() === "mac" ? "Meta" : "Control"
}




export default class AdminPage extends Page {


  private appendPageToCanvas(...pages: HTMLElement[]) {
    this.body.canvas.apd(pages.map(page => {
      if ("disableContentVisibilityOptimisation" in (page as SectionedPage)) (page as SectionedPage).disableContentVisibilityOptimisation()

      const d = new Data("hello")
      d.get(() => {
        throw new UrlDuplicateError()
      }, false)

      const frame = new PageFrame(page, d)
      this.addNoScaleAddons(frame.heading)
      // @ts-ignore
      frame.heading.css({
        transformOrigin: "left bottom",
        willChange: "transform"
      })
      return frame
    }))
  }

  private specialAddonList: LinkedList<HTMLElement> = new LinkedList()
  private addNoScaleAddons(addon: HTMLElement) {
    return this.specialAddonList.push(addon) as { remove: () => void }
  }

  constructor(posStoreName = "") {
    super()


    const adminPos = localSettings("adminPos" + posStoreName, {
      x: 0,
      y: 0,
      z: 1,
      zoomOffset: {
        x: 0,
        y: 0
      }
    })

    window.addEventListener("beforeunload", function (e) {
      adminPos(abs)
    });



    this.appendPageToCanvas(
      ce("test-box"),
      new ContactPage(),
      new HomePage("admin"),
    )



    


    const container = this.body.canvasContainer as HTMLElement
    const target = this.body.moveArea as HTMLElement
    const child = target.children[0] as HTMLElement


    const abs = clone(adminPos()) as {
      x: number;
      y: number;
      z: number;
      zoomOffset: {
          x: number;
          y: number;
      }
    }


    const wheelIdle = isIdle()


    let startedWheelWithControl = false
    wheelIdle.get((isIdle) => {
      if (!isIdle) startedWheelWithControl = holdingControl
    }, false)



    const howFarOutOfBounds = {
      x: 0,
      y: 0
    }

    const delta = {
      x: 0,
      y: 0
    }


    const distributeExplicitWheelEventOverXFrames = 12 // in 60fps
    const distributeExplicitWheelEventOverXFramesAtThisMovement = 125 // in chrome 125
    const normalizedDistributeExplicitWheelEventOverXFrames = distributeExplicitWheelEventOverXFrames / distributeExplicitWheelEventOverXFramesAtThisMovement

    container.on("wheel", (e: WheelEvent) => {
      wheelIdle.stillActive()

      e.preventDefault()
      if (!e.ctrlKey && !startedWheelWithControl) {

        // pan
        if (e.shiftKey) {
          delta.x = e.deltaY
          delta.y = 0
        }
        else {
          delta.x = e.deltaX
          delta.y = e.deltaY
        }


        if (Math.abs(delta.y) > 50 && Math.round(delta.y) === delta.y) {
          // assume mousewheel scroll
          const maxAbs = normalizedDistributeExplicitWheelEventOverXFrames * Math.abs(delta.y)
          
          let prog = stats.delta
          let easedProg = scrollWheelEasingFunc(prog / maxAbs)
          const fullMovement = delta.y
          
          delta.y = fullMovement * easedProg
          
          const e = animationFrameDelta((del) => {
            prog += del
            let linearProg = prog / maxAbs
            if (linearProg > 1) linearProg = 1
            let easedProgDelta = easedProg
            easedProg = scrollWheelEasingFunc(linearProg)
            easedProgDelta = easedProg - easedProgDelta
            const easedFraction = fullMovement * easedProgDelta
            abs.y -= easedFraction
            delta.y += easedFraction
            if (prog >= maxAbs) {
              e.cancel()
            }
          })
        }
        // copy the same code for the other axis (maybe abstract)
        else if (Math.abs(delta.x) > 50 && Math.round(delta.x) === delta.x) {
          // assume mousewheel scroll
          const maxAbs = normalizedDistributeExplicitWheelEventOverXFrames * Math.abs(delta.x)
          
          let prog = stats.delta
          let easedProg = scrollWheelEasingFunc(prog / maxAbs)
          const fullMovement = delta.x
          
          delta.x = fullMovement * easedProg

          const e = animationFrameDelta((del) => {
            prog += del
            let linearProg = prog / maxAbs
            if (linearProg > 1) linearProg = 1
            let easedProgDelta = easedProg
            easedProg = scrollWheelEasingFunc(linearProg)
            easedProgDelta = easedProg - easedProgDelta
            const easedFraction = fullMovement * easedProgDelta
            abs.x -= easedFraction
            delta.x += easedFraction
            if (prog >= maxAbs) {
              e.cancel()
            }
          })
        }

          


        abs.x -= delta.x
        abs.y -= delta.y

        inertiaRender.cancel()
        e.stopPropagation()  
      }
      else {

        // zoom
        let zoom = 1 - ((Math.abs(e.deltaY) > maxZoomStep ? Math.sign(e.deltaY) * maxZoomStep : e.deltaY) / 100)
        abs.z *= zoom
        if (child.width() * abs.z < target.width()) {
          const maxZ = target.width() / child.width()
          zoom = maxZ / abs.z
          abs.z = maxZ
        }
        if (child.height() * abs.z < target.height()) {
          const maxZ = target.height() / child.height()
          zoom = maxZ / abs.z
          abs.z = maxZ
        }



        // keep the zoom around the pointer
        const pointerX = e.clientX + abs.zoomOffset.x - abs.x
        const pointerY = e.clientY + abs.zoomOffset.y - abs.y

        abs.zoomOffset.x += pointerX * (zoom - 1)
        abs.zoomOffset.y += pointerY * (zoom - 1)

        

      }

    }, true)


    


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
      holdingControl = false
    })
    document.body.on("mouseleave", () => {
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


    // touch
    container.on("touchstart", (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchOffset = {x: 0, y: 0}
        curCoords.x = e.touches[0].clientX
        curCoords.y = e.touches[0].clientY
        inertiaRender.cancel()
      }
    })

    const noMoreTouchEventHandler = (e: TouchEvent) => {
      if (e.touches.length === 0) inertiaRender.resume()
    }


    // const redDot = ce("red-dot")
    // redDot.css({
    //   position: "absolute",
    //   left: 0,
    //   right: 0,
    //   width: "50px",
    //   height: "50px",
    //   borderRadius: "50%",
    //   background: "red",
    //   opacity: 0.5,
    //   transform: "translate(-50%, -50%)"
    // })
    // container.append(redDot)


    document.body.on("touchend", noMoreTouchEventHandler)
    document.body.on("touchcancel", noMoreTouchEventHandler)


    let lastZoomDist: number

    
    container.on("touchstart", (e) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1] || {clientX: 0, clientY: 0}
        lastZoomDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)
      }
    })




    let wasZoomingJustBefore = false
    let touch2Cache: {clientX: number, clientY: number}
    let touchOffset = {
      x: 0,
      y: 0
    }

    container.on("touchmove", (e: TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.touches.length === 1) {

        if (wasZoomingJustBefore) {
          wasZoomingJustBefore = false

          

          const coordDiffs = {
            x: e.touches[0].clientX - touch2Cache.clientX,
            y: e.touches[0].clientY - touch2Cache.clientY
          }
          const dist = Math.hypot(coordDiffs.x, coordDiffs.y)
          if (Math.abs(dist) > 30) touchOffset = coordDiffs

        }

        const clientX = e.touches[0].clientX - touchOffset.x
        const clientY = e.touches[0].clientY - touchOffset.y


        delta.x = clientX - curCoords.x
        delta.y = clientY - curCoords.y

        abs.x += delta.x
        abs.y += delta.y

        curCoords.x = clientX
        curCoords.y = clientY
      }
      if (e.touches.length === 2) {
        wasZoomingJustBefore = true
        const touch1 = touch2Cache = e.touches[0]
        const touch2 = e.touches[1]
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)
        const zoom = 1 + ((dist - lastZoomDist) / 200)
        abs.z *= zoom
        lastZoomDist = dist



        const centerOfZoom = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2
        }

        const pointerX = centerOfZoom.x + abs.zoomOffset.x - abs.x
        const pointerY = centerOfZoom.y + abs.zoomOffset.y - abs.y

        abs.zoomOffset.x += pointerX * (zoom - 1)
        abs.zoomOffset.y += pointerY * (zoom - 1)


        // // draw a red dot at centerOfZoom
        // redDot.css({
        //   left: centerOfZoom.x,
        //   top: centerOfZoom.y
        // })
      }
    }, {passive: false})

    // zoom touch







    const minMove = .1 / abs.z
    const inertiaRender = animationFrameDelta(() => {
      if (Math.abs(delta.x) > minMove || Math.abs(delta.y) > minMove) {
        delta.x *= 0.955
        delta.y *= 0.955
        abs.x += delta.x
        abs.y += delta.y
      }
      else {
        inertiaRender.cancel()
      }
    })
    inertiaRender.cancel()

    
    let holdingControl = false
    const ctrlKey = getCtrlKey()
    document.body.on("keydown", (e) => {
      if (e.key === ctrlKey) {
        holdingControl = true  
      }
    })
    document.body.on("keyup", (e) => {
      if (e.key === ctrlKey) {
        holdingControl = false
      }
    })



    







    const renderedCoords = clone(abs)


    const moveWithoutSmooth = 5
    function cappedSmooth(soll: number, ist: number) {
      let diff = soll - ist
      if (Math.abs(diff) > moveWithoutSmooth) {
        const move = (Math.sign(diff) * moveWithoutSmooth)
        return smooth(diff, move) + move
      }
      else {
        return diff
      }
    }

    function smooth(soll: number, ist: number) {
      return (soll - ist) * .3
    }


    animationFrameDelta(() => {

      // smooths the panning by approaching the target coordinates (abs)
      // console.log(cappedSmooth(abs.y, renderedCoords.y))
      
      renderedCoords.x += cappedSmooth(abs.x, renderedCoords.x)
      renderedCoords.y += cappedSmooth(abs.y, renderedCoords.y)
      renderedCoords.z += smooth(abs.z, renderedCoords.z)
      renderedCoords.zoomOffset.x += smooth(abs.zoomOffset.x, renderedCoords.zoomOffset.x)
      renderedCoords.zoomOffset.y += smooth(abs.zoomOffset.y, renderedCoords.zoomOffset.y)

      
      let x = renderedCoords.x - renderedCoords.zoomOffset.x
      let y = renderedCoords.y - renderedCoords.zoomOffset.y
      const z = renderedCoords.z

      const w = x - target.width() + child.width() * z
      const h = y - target.height() + child.height() * z
      
      howFarOutOfBounds.x = x > 0 ? -x : w < 0 ? -w : 0
      howFarOutOfBounds.y = y > 0 ? -y : h < 0 ? -h : 0

      if (Math.abs(howFarOutOfBounds.x) > .1) {
        const w = howFarOutOfBounds.x * .4
        x += w
        abs.x += w
        renderedCoords.x += w
      }
      if (Math.abs(howFarOutOfBounds.y) > .1) {
        const w = howFarOutOfBounds.y * .4
        y += w
        abs.y += w
        renderedCoords.y += w
      }


      target.css({
        translateX: x,
        translateY: y,
        scale: z
      }) 


      for (const addon of this.specialAddonList) {
        addon.css({
          scale: 1 / z
        }) 
      }


      // set abs coordinates to localstorage on every frame (not needed as we save them on pageunload)
      // adminPos(abs)
    })



  }

  protected tryNavigationCallback(domainFragment: string): boolean | void | Promise<boolean | void> {
    // return adminSession.get() !== ""
  }
  
  private pageLs: ElementList<Page>
  public async minimalContentPaint(): Promise<void> {
    this.pageLs = this.body.canvas.childs("c-page-frame > *", true) as ElementList<Page>
    await Promise.all([this.pageLs.map((page: Page) => page.minimalContentPaint ? page.minimalContentPaint() : undefined)])
    await super.minimalContentPaint()
  }

  public async fullContentPaint(): Promise<void> {
    await Promise.all([this.pageLs.map((page: Page) => page.fullContentPaint ? page.fullContentPaint() : undefined)])
    await super.fullContentPaint()
  }

  public async completePaint(): Promise<void> {
    await Promise.all([this.pageLs.map((page: Page) => page.completePaint ? page.completePaint() : undefined)])
    await super.completePaint()
  }



  stl() {
    return super.stl() + require("./adminPage.css").toString()
  }
  pug() {
    return require("./adminPage.pug").default
  }
}
declareComponent("admin-page", AdminPage)
