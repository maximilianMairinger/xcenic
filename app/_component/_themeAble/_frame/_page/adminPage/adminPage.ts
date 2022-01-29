import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import adminSession from "../../../../../lib/adminSession"

import ContactPage from "./../contactPage/contactPage"
import { ElementList } from "extended-dom"
import animationFrameDelta, { ignoreUnsubscriptionError, stats } from "animation-frame-delta"
import Easing from "waapi-easing"
const scrollWheelEasingFunc = (new Easing("easeInOut")).function


const dragMouseButton = 1
const maxZoomStep = 20 // percent





function getPlatform() {
  const platform = ((navigator as any).userAgentData !== undefined ? (navigator as any).userAgentData.platform : navigator.platform).toLowerCase() as string
  return platform.includes("win") ? "win" : platform.includes("mac") ? "mac" : platform.includes("linux") ? "linux" : null
}

function getCtrlKey() {
  return getPlatform() === "mac" ? "Meta" : "Control"
}


export default class AdminPage extends Page {

  constructor() {
    super()

    const ar = []
    for (let i = 0; i < 1000; i++) {
      ar.add(ce("test-box"))
      
    }

    this.body.canvas.apd(
      ce("page-frame").apd(
        ...ar
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


    const distributeExplicitWheelEventOverXFrames = 12 // in 60fps
    const distributeExplicitWheelEventOverXFramesAtThisMovement = 125 // in chrome 125
    const normalizedDistributeExplicitWheelEventOverXFrames = distributeExplicitWheelEventOverXFrames / distributeExplicitWheelEventOverXFramesAtThisMovement

    container.on("wheel", (e: WheelEvent) => {
      e.preventDefault();
      if (!e.ctrlKey && !holdingControl) {

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
          console.log("mousewheel scroll", delta.y)
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
              console.log("mousewheel scroll end")
              e.cancel()
            }
          })
        }
        // copy the same code for the other axis
        else if (Math.abs(delta.x) > 50 && Math.round(delta.x) === delta.x) {
          // assume mousewheel scroll
          console.log("mousewheel scroll", delta.x)
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
              console.log("mousewheel scroll end")
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
        const zoom = 1 - ((Math.abs(e.deltaY) > maxZoomStep ? Math.sign(e.deltaY) * maxZoomStep : e.deltaY) / 100)
        abs.z *= zoom

        // keep the zoom around the pointer
        const pointerX = (e.clientX + zoomOffsetTransition.x - abs.x)
        const pointerY = (e.clientY + zoomOffsetTransition.y - abs.y)

        zoomOffsetTransition.x += pointerX * (zoom - 1)
        zoomOffsetTransition.y += pointerY * (zoom - 1)

        

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


    const redDot = ce("red-dot")
    redDot.css({
      position: "absolute",
      left: 0,
      right: 0,
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      background: "red",
      opacity: 0.5,
      transform: "translate(-50%, -50%)"
    })
    container.append(redDot)


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

    const debugElem = ce("span").html("hello")
    debugElem.css({
      color: "white",
      fontSize: "30px",
      padding: 100,
      display: "block",
    })
    this.body.canvas.prepend(debugElem)



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

          debugElem.html("offset: " + JSON.stringify(touchOffset))
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

        const pointerX = (centerOfZoom.x + zoomOffsetTransition.x - abs.x)
        const pointerY = (centerOfZoom.y + zoomOffsetTransition.y - abs.y)

        zoomOffsetTransition.x += pointerX * (zoom - 1)
        zoomOffsetTransition.y += pointerY * (zoom - 1)


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



    







    const renderedCoords = {
      x: 0,
      y: 0,
      z: 0,
      zoomOffset: {
        x: 0,
        y: 0
      }
    }


    const moveWithoutSmooth = 5
    function cappedSmooth(soll: number, ist: number) {
      let diff = soll - ist
      if (Math.abs(diff) > moveWithoutSmooth) {
        return diff * .2 + (Math.sign(diff) * moveWithoutSmooth)
      }
      else {
        return diff
      }
    }

    function smooth(soll: number, ist: number) {
      return (soll - ist) * .2
    }


    animationFrameDelta(() => {

      // smooths the panning by approaching the target coordinates (abs)
      // console.log(c/*  */appedSmooth(abs.y, renderedCoords.y))
      
      renderedCoords.x += cappedSmooth(abs.x, renderedCoords.x)
      renderedCoords.y += cappedSmooth(abs.y, renderedCoords.y)
      renderedCoords.z += smooth(abs.z, renderedCoords.z)
      renderedCoords.zoomOffset.x += smooth(zoomOffsetTransition.x, renderedCoords.zoomOffset.x)
      renderedCoords.zoomOffset.y += smooth(zoomOffsetTransition.y, renderedCoords.zoomOffset.y)

      
      let x = renderedCoords.x - renderedCoords.zoomOffset.x
      let y = renderedCoords.y - renderedCoords.zoomOffset.y
      const z = renderedCoords.z

      const w = x - target.width() + child.width() * z
      const h = y - target.height() + child.height() * z
      
      howFarOutOfBounds.x = x > 0 ? -x : w < 0 ? -w : 0
      howFarOutOfBounds.y = y > 0 ? -y : h < 0 ? -h : 0

      if (Math.abs(howFarOutOfBounds.x) > .4) {
        const w = howFarOutOfBounds.x * .4
        x += w
        abs.x += w
        renderedCoords.x += w
      }
      if (Math.abs(howFarOutOfBounds.y) > .4) {
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
    })


    // const pz = new PanZ({
    //   minZoom: .001,
    //   zoomSpeed: .5,
    //   // bounds: 1
    // });
    // pz.init(this.body.zoomArea);


  }

  protected tryNavigationCallback(domainFragment: string): boolean | void | Promise<boolean | void> {
    // return adminSession.get() !== ""
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
