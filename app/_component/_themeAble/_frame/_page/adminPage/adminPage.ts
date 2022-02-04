import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import adminSession from "../../../../../lib/adminSession"
import localSettings from "./../../../../../lib/localSettings"
import { ElementList } from "extended-dom"
import animationFrameDelta, { ignoreUnsubscriptionError, stats } from "animation-frame-delta"
import Easing from "waapi-easing"
import isIdle from "is-idle"
import LinkedList from "fast-linked-list"



import ContactPage from "./../contactPage/contactPage"
import HomePage from "./../_sectionedPage/_lazySectionedPage/homepage/homepage"
import SectionedPage from "../_sectionedPage/sectionedPage"
import PageFrame, { UrlDuplicateError } from "./pageFrame/pageFrame"
import { Data, DataBase, DataCollection } from "josm"
import clone from "fast-copy"



type Mutable<T> = {
  -readonly[P in keyof T]: T[P]
};


const dragMouseButton = 1
const maxZoomStep = 20 // percent
const scrollWheelEasingFunc = (new Easing("easeInOut")).function


const oneSideTemplate = {
  pages: [] as PageFrame[],
  distancesPerSide: {
    left: [] as number[],
    right: [] as number[],
    top: [] as number[],
    bottom: [] as number[]
  }
}




function getPlatform() {
  const platform = ((navigator as any).userAgentData !== undefined ? (navigator as any).userAgentData.platform : navigator.platform).toLowerCase() as string
  return platform.includes("win") ? "win" : platform.includes("mac") ? "mac" : platform.includes("linux") ? "linux" : null
}

function getCtrlKey() {
  return getPlatform() === "mac" ? "Meta" : "Control"
}

type Side = "left" | "right" | "top" | "bottom"


const oppisiteSideIndex = {
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top"
}

const rightAngleSideIndex = {
  left: ["top", "bottom"],
  right: ["top", "bottom"],
  top: ["left", "right"],
  bottom: ["left", "right"]
}

const sideToDirIndex = {
  left: 1,
  right: -1,
  top: 1,
  bottom: -1
}

const boundAddonInitPosSymbol = Symbol("addonInitPos")

type Rect = {top: number, left: number, right: number, bottom: number}

export default class AdminPage extends Page {

  private normalizedWidthData = this.resizeData().tunnel(e => e.width / 1500) 


  private getBoundingRectOfFrame(element: PageFrame) {
    const pos = element.pos
    const margin = 50
    const width = document.body.width()
    const height = element.height()
    return {
      top: pos.y.get(),
      left: pos.x.get(),
      right: pos.x.get() + width,
      bottom: pos.y.get() + height,
      width,
      height
    }

  }
     

  // find out if the page is colliding with another page and if so return the side where they colliding in decrasing order
  private pageIsCollidingWith(myBounds: Rect, otherBounds: Rect) {
    // calculate how far we are colliding on each side.
    const left = {distance: myBounds.left - otherBounds.right, side: "left"}
    const right = {distance: otherBounds.left - myBounds.right, side: "right"}
    const top = {distance: myBounds.top - otherBounds.bottom, side: "top"}
    const bottom = {distance: otherBounds.top - myBounds.bottom, side: "bottom"}


    // return false when not colliding
    if (!(left.distance < 0 && top.distance < 0 && right.distance < 0 && bottom.distance < 0)) return false

    const where = () => {
      const collidingSides = [left, right, top, bottom].filter(side => side.distance < 0) as {distance: number, side: Side}[]
      // sort by colliding value in ascending order (closest from myBounds)
      collidingSides.sort((a, b) => b.distance - a.distance)
  
      return collidingSides
    }
    return where
  }

  private findNextFreeSpace(pageToFit: PageFrame, collidingPages: PageFrame[], trySides: {distance: number, side: Side}[]) {
    const pageToFitBounds = this.getBoundingRectOfFrame(pageToFit)


    const collisionsPerSide = {
      left: clone(oneSideTemplate),
      right: clone(oneSideTemplate),
      top: clone(oneSideTemplate),
      bottom: clone(oneSideTemplate)
    }


    for (const side of trySides) {
      const tryBounds = clone(pageToFitBounds) as Mutable<DOMRect>
      const dir = sideToDirIndex[side.side]
      tryBounds[side.side] += Math.abs(side.distance) * dir
      tryBounds[oppisiteSideIndex[side.side]] += Math.abs(side.distance) * dir


      const col = collisionsPerSide[side.side]
      for (const p of this.pages) {
        if (p === pageToFit || collidingPages.includes(p)) continue
        const collision = this.pageIsCollidingWith(tryBounds, this.getBoundingRectOfFrame(p))
        if (collision) {
          col.pages.push(p)

          const newCols = collision()
          for (const newCol of newCols) {
            col.distancesPerSide[newCol.side].push(newCol.distance)
          }
        }
      }

      if (col.pages.empty) return tryBounds
    }


    const recursivelyTryAgain = () => {

      const tryDeeper = [] as Function[]
      for (const side in trySides.Inner("side")) {
        const newCollision = collisionsPerSide[side as Side]
        if (!newCollision.pages.empty) {
          const newSides = this.calculateBoundingSides(newCollision.distancesPerSide)
          // order newSides so that the closest right angle is first, then the other right angle second, then the same direction as last time third, then the direction backwards fourth
          const rightAngleSides = rightAngleSideIndex[trySides.first.side]
          const rightAngleSidesInOrder = [] as Side[]
          for (const newSide of newSides) {
            if (newSide.side === rightAngleSides[0]) {
              rightAngleSidesInOrder.push(trySides[0].side, trySides[1].side)
              break
            }
            else if (newSide.side === rightAngleSides[1]) {
              rightAngleSidesInOrder.push(trySides[1].side, trySides[0].side)
              break
            }
          }

          const newSidesInOrder = [...rightAngleSidesInOrder, oppisiteSideIndex[trySides.first.side], trySides.first.side]
          // order newSides to fit newSidesInOrder
          newSides.sort((a, b) => {
            const aIndex = newSidesInOrder.indexOf(a.side)
            const bIndex = newSidesInOrder.indexOf(b.side)
            return aIndex - bIndex
          })
          


          const ret = this.findNextFreeSpace(pageToFit, newCollision.pages, newSides)
          if (!(ret instanceof Function)) return ret
          else tryDeeper.push(ret)
        }
      }


      const evenDeeper = () => {
        const againDeeper = [] as Function[]
        for (const deep of tryDeeper) {
          const ret = deep()
          if (!(ret instanceof Function)) return ret
          againDeeper.push(ret)
        }
        tryDeeper.clear().push(...againDeeper)
        return evenDeeper
      }

      return evenDeeper
    }

    return recursivelyTryAgain
  }


  private async ensurePageIsInFreeSpace(page: PageFrame) {
    const collisions: {page: PageFrame, cols: {side: Side, distance: number}[]}[] = []
    for (const p of this.pages) {
      if (p === page) continue
      let collision = this.pageIsCollidingWith(this.getBoundingRectOfFrame(page), this.getBoundingRectOfFrame(p))
      if (collision) {
        const colly = {page: p, cols: [] as {side: Side, distance: number}[]}
        collisions.push(colly)
        const cols = collision()
        colly.cols.push(...cols)
        colly.page = p
      }
    }

    if (!collisions.empty) {
      console.log("collision with", collisions)
      // const boundingSides = this.calculateBoundingSides(collisions.distancesPerSide)
      const callAgainLs = [] as Function[]

      for (const collision of collisions) {
        const freeSpace = this.findNextFreeSpace(page, [collision.page], collision.cols)
        if (freeSpace instanceof Function) {
          callAgainLs.push(freeSpace)
        }
        else {
          page.pos({x: freeSpace.left, y: freeSpace.top})
          return
        }
      }

      let nthTry = 0
      while (nthTry > 50) {
        nthTry++

        let solutions = [] as {left: number, top: number}[]
        for (const callAgain of callAgainLs) {
          let freeSpace = callAgain()

          let innerTry = 0
          
          while(innerTry < 10) {
            innerTry++
            if (freeSpace instanceof Function) {
              freeSpace = freeSpace()
            }
            else {
              solutions.push(freeSpace)
              break
            }
          }
          callAgainLs.push(freeSpace)
          
        }

        if (!solutions.empty) {
          // weight solutions by distance from original position
          const originalPos = page.pos()
          solutions.sort((a, b) => {
            // pytagoras
            const aDist = Math.sqrt(Math.pow(a.left - originalPos.x, 2) + Math.pow(originalPos.y, 2))
            const bDist = Math.sqrt(Math.pow(b.left - originalPos.x, 2) + Math.pow(originalPos.y, 2))
            return aDist - bDist
          })
          const bestSolution = solutions.first
          page.pos({x: bestSolution.left, y: bestSolution.top})
        }


        callAgainLs.clear()
      }
      console.error("Could not find free space for page", page)
    }
  }

  private calculateBoundingSides(collisions: {[side in Side]: number[]}): {distance: number, side: Side}[] {
    const boundingSides = [] as {distance: number, side: Side}[]
    for (const side in collisions) {
      // take the one that overlaps the most
      const distance = Math.min(...collisions[side])
      boundingSides.push({distance, side: side as Side})
    }
    boundingSides.sort((a, b) => b.distance - a.distance)
    return boundingSides
  }


      
  private pages = [] as PageFrame[]

  private addedPagesCount = 0
  private appendPageToCanvas(...pages: HTMLElement[]) {
    const abs = this.abs
    this.body.canvas.apd(pages.map(page => {
      if ("disableContentVisibilityOptimisation" in (page as SectionedPage)) (page as SectionedPage).disableContentVisibilityOptimisation()



      const d = new Data("hello")
      d.get(() => {
        throw new UrlDuplicateError()
      }, false)

      



      const frame = new PageFrame(page, d, localSettings("pageFrame" + this.addedPagesCount, {x: 200 + 1700 * this.addedPagesCount, y: 0}), abs, this.normalizedWidthData, this.addNoScaleBoundAddon.bind(this))
      frame.currentlyMoving.get((moving) => {
        if (moving) {
          frame.css({zIndex: 1})
        }
        else {
          // frame.css({zIndex: "initial"})
          this.ensurePageIsInFreeSpace(frame)
        }
      }, false)
      
      this.pages.push(frame)


      this.addedPagesCount++

      
      this.addNoScaleAddons(frame.heading)
      // @ts-ignore
      frame.heading.css({
        transformOrigin: "left bottom",
        willChange: "transform"
      })
      return frame
    }))
  }

  private noScaleElementList: LinkedList<HTMLElement> = new LinkedList()
  private noScaleBoundElementList: LinkedList<HTMLElement> = new LinkedList()

  private addNoScaleAddons(addon: HTMLElement) {
    return this.noScaleElementList.push(addon) as { remove: () => void }
  }


  private addNoScaleBoundAddon(addon: HTMLElement, initPos?: {x: number, y: number}) {
    if (initPos) {
      addon.css({
        position: "absolute",
        top: 0,
        left: 0
      })
      this.body.canvas.apd(addon)
      addon[boundAddonInitPosSymbol] = initPos

      const tok = this.noScaleBoundElementList.push(addon) as { remove: () => void }
      return {remove: () => {
        addon.remove()
        tok.remove()
      }}
    }
    else {
      initPos = addon.getBoundingClientRect()
      addon[boundAddonInitPosSymbol] = initPos
      return this.noScaleBoundElementList.push(addon) as { remove: () => void }
    }

    
  }
  
  private abs: {x: number, y: number, z: number, zoomOffset: {x: number, y: number}}

  constructor(posStoreName = "") {
    super()


    const adminPos = localSettings("adminPos" + posStoreName, {
      x: 400,
      y: 400,
      z: .5,
      zoomOffset: {
        x: 0,
        y: 0
      }
    })

    window.addEventListener("beforeunload", function (e) {
      adminPos(abs)
    });



    const abs = this.abs = clone(adminPos()) as {
      x: number;
      y: number;
      z: number;
      zoomOffset: {
          x: number;
          y: number;
      }
    }


    this.appendPageToCanvas(
      ce("test-box"),
      ce("test-box"),
      ce("test-box"),
      ce("test-box"),
      ce("test-box"),
      ce("test-box"),
      ce("test-box"),
      // new ContactPage(),
      // new HomePage("admin"),
    )



    


    const container = this.body.canvasContainer as HTMLElement
    const target = this.body.moveArea as HTMLElement
    const child = target.children[0] as HTMLElement




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
        const pointerX = e.clientX * 0 + abs.zoomOffset.x - abs.x
        const pointerY = e.clientY * 0 + abs.zoomOffset.y - abs.y

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

    const marginOfFrame = {
      top: child.css("marginTop"),
      left: child.css("marginLeft")
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

      target.style.setProperty("--scale", z.toString())

      const invZ = 1 / z
      for (const addon of this.noScaleElementList) {
        addon.css({
          scale: invZ
        }) 
      }
      for (const addon of this.noScaleBoundElementList) {

        const { x: myX, y: myY } = addon[boundAddonInitPosSymbol]
        
        let localX = myX
        let localY = myY
        
        // if (-x > myX) localX = -x
        // if (-y > myY) localY = -y

        // consider scale
        if (-x + target.width() < myX + addon.width()) localX = -x + target.width() - addon.width()
        // if (-y + target.height() < myY + addon.height()) localY = -y + target.height() - (myY + addon.height())
        
        addon.css({
          scale: invZ,
          translateX: localX * invZ,
          translateY: localY * invZ
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
