import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import adminSession from "../../../../../lib/adminSession"
import localSettings from "./../../../../../lib/localSettings"
import { ElementList } from "extended-dom"
import animationFrameDelta, { absoluteDeltaAt60FPS, ignoreUnsubscriptionError, stats } from "animation-frame-delta"
import Easing from "waapi-easing"
import isIdle from "is-idle"
import LinkedList from "fast-linked-list"



import ContactPage from "./../contactPage/contactPage"
import HomePage from "./../_sectionedPage/_lazySectionedPage/homepage/homepage"
import SectionedPage from "../_sectionedPage/sectionedPage"
import PageFrame, { minDistanceTop, UrlDuplicateError } from "./pageFrame/pageFrame"
import { Data, DataBase, DataCollection } from "josm"
import clone from "fast-copy"





export function smoothWith(fac: number = .3) {
  return function smooth(soll: number, ist: number) {
    return (soll - ist) * fac
  }
}

export const smooth = smoothWith()

export function cappedSmoothAt(moveWithoutSmooth: number = 5, smoothFac = .3) {
  return function cappedSmooth(soll: number, ist: number) {
    let diff = soll - ist
    if (Math.abs(diff) > moveWithoutSmooth) {
      const move = (Math.sign(diff) * moveWithoutSmooth)
      return (diff - move) * smoothFac + move
    }
    else {
      return diff
    }
  }
}

export const cappedSmooth = cappedSmoothAt()


type PositionalHTMLElement = HTMLElement & {
  getScaledX(): number
  getScaledY(): number
  addUnscaledX(x: number): void
  addUnscaledY(y: number): void
  getScaledPos(): { x: number, y: number }
}


type Mutable<T> = {
  -readonly[P in keyof T]: T[P]
};


const dragMouseButton = 1
const maxZoomStep = 20 // percent
const scrollWheelEasingFunc = (new Easing("easeInOut")).function
const collisionResolveEasingFunc = (new Easing("easeOut")).function



const oneSideTemplate = {
  pages: [] as HTMLElement[],
  tryBounds: {} as Partial<Bounds>,
  distancesPerSide: {
    left: [] as number[],
    right: [] as number[],
    top: [] as number[],
    bottom: [] as number[]
  }
}

type Bounds = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
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


const maxZIndex = 100000

const boundAddonInitPosSymbol = Symbol("addonInitPos")

type Rect = {top: number, left: number, right: number, bottom: number}

const holyWidthDivider = 1500

export default class AdminPage extends Page {

  private normalizedWidthData = this.resizeData().tunnel(e => e.width / holyWidthDivider) 

  private getMargin() {
     /* p / this.abs.z */
    return {
      top: 70,
      left: 20,
      right: 20,
      bottom: 70
    }
  }


  private getBoundingRectOfFrame(element: PositionalHTMLElement) {
    const posX = element.getScaledX()
    const posY = element.getScaledY()
    const margin = this.getMargin()
    const width = element.width() / this.width() * holyWidthDivider
    const height = element.height() // takes very long maybo optimize
    return {
      top: posY - margin.top,
      left: posX - margin.left,
      right: posX + width + margin.right,
      bottom: posY + height + margin.bottom,
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

  private findNextFreeSpace(pageToFit: PageFrame, collidingPages: HTMLElement[], pageToFitBounds: Bounds, trySides: {distance: number, side: Side}[]) {


    const collisionsPerSide = {
      left: clone(oneSideTemplate),
      right: clone(oneSideTemplate),
      top: clone(oneSideTemplate),
      bottom: clone(oneSideTemplate)
    }

    const solutions = []


    for (const side of trySides) {
      const tryBounds = clone(pageToFitBounds) as Mutable<DOMRect>
      const dir = sideToDirIndex[side.side]
      const dif = Math.abs(side.distance) * dir
      tryBounds[side.side] += dif
      tryBounds[oppisiteSideIndex[side.side]] += dif

      const col = collisionsPerSide[oppisiteSideIndex[side.side]] as typeof oneSideTemplate
      col.tryBounds = tryBounds
      for (const p of this.canvasees) {
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

      if (col.pages.empty) solutions.push(tryBounds)
    }


    let allEmpty = true
    for (const side in collisionsPerSide) if (!collisionsPerSide[side].pages.empty) allEmpty = false

    if (allEmpty) return {
      solutions
    }

    const recursivelyTryAgain = () => {

      const solutions = [] 

      const tryDeeper = [] as Function[]
      for (const side of trySides.Inner("side")) {
        const newCollision = collisionsPerSide[side as Side]
        if (!newCollision.pages.empty) {
          const boundingCollisionDiffs = this.calculateBoundingSides(newCollision.distancesPerSide)
          // order newSides so that the closest right angle is first, then the other right angle second, then the same direction as last time third, then the direction backwards fourth
          const rightAngleSides = rightAngleSideIndex[trySides.first.side] as Side[]
          const rightAngleSidesInOrder = [] as Side[]
          for (const boundingCollisionDiff of boundingCollisionDiffs) {
            if (boundingCollisionDiff.side === rightAngleSides[0]) {
              rightAngleSidesInOrder.push(...rightAngleSides)
              break
            }
            else if (boundingCollisionDiff.side === rightAngleSides[1]) {
              rightAngleSidesInOrder.push(rightAngleSides[1], rightAngleSides[0])
              break
            }
          }

          const newSidesInOrder = [...rightAngleSidesInOrder, oppisiteSideIndex[trySides.first.side], trySides.first.side]
          // order newSides to fit newSidesInOrder
          boundingCollisionDiffs.sort((a, b) => {
            const aIndex = newSidesInOrder.indexOf(a.side)
            const bIndex = newSidesInOrder.indexOf(b.side)
            return aIndex - bIndex
          })
          


          const ret = this.findNextFreeSpace(pageToFit, newCollision.pages, newCollision.tryBounds as Bounds, boundingCollisionDiffs)
          solutions.push(...ret.solutions)
          if (ret.tryDeeper !== undefined) tryDeeper.push(ret.tryDeeper)
        }
      }

      let allEmpty = true
      for (const side in collisionsPerSide) if (!collisionsPerSide[side].pages.empty) allEmpty = false
  
      if (allEmpty) return {
        solutions
      }


      const evenDeeper = () => {
        const againDeeper = [] as Function[]
        const solutions = []
        for (const deep of tryDeeper) {
          const ret = deep()
          solutions.push(...ret.solutions)
          if (ret.tryDeeper !== undefined) againDeeper.push(ret.tryDeeper)
        }
        tryDeeper.clear().push(...againDeeper)
        return {
          solutions,
          tryDeeper: evenDeeper
        } 
      }

      return {
        tryDeeper: evenDeeper,
        solutions
      }
    }

    return {
      tryDeeper: recursivelyTryAgain,
      solutions
    }
  }


  private async ensurePageIsInFreeSpace(page: PageFrame) {
    const boundsOfPage = this.getBoundingRectOfFrame(page)
    const collisions: {page: HTMLElement, cols: {side: Side, distance: number}[]}[] = []
    for (const p of this.canvasees) {
      if (p === page) continue
      let collision = this.pageIsCollidingWith(boundsOfPage, this.getBoundingRectOfFrame(p))
      if (collision) {
        const colly = {page: p, cols: [] as {side: Side, distance: number}[]}
        collisions.push(colly)
        const cols = collision()
        colly.cols.push(...cols)
        colly.page = p
      }
    }


    if (!collisions.empty) {

      const setToPage = (x: number, y: number) => {
        const margin = this.getMargin()
        x += margin.left
        y += margin.top

        const beginCoords = clone(page.getScaledPos()) as {x: number, y: number}
        const deltaCoords = {
          x: x - beginCoords.x,
          y: y - beginCoords.y
        }

        const totalTime = Math.hypot(x - beginCoords.x, y - beginCoords.y) / 4 + 100
        return animationFrameDelta((timePassed) => {
          const absProg = timePassed / totalTime
          const prog = collisionResolveEasingFunc(absProg)

          page.setScaledPos({x: beginCoords.x + deltaCoords.x * prog, y: beginCoords.y + deltaCoords.y * prog})
        }, totalTime)
      }
      // const boundingSides = this.calculateBoundingSides(collisions.distancesPerSide)
      const callAgainLs = [] as (() => {
        solutions: {left: number, top: number}[];
        tryDeeper?: Function;
      })[]

      for (const collision of collisions) {
        callAgainLs.push(() => this.findNextFreeSpace(page, [collision.page], this.getBoundingRectOfFrame(page), collision.cols))
      }

      let nthTry = 0
      while (nthTry < 10) {
        nthTry++

        let solutions = [] as {left: number, top: number}[]
        for (let i = 0; i < callAgainLs.length; i++) {
          const callAgain = callAgainLs[i]
          
          let freeSpace = callAgain()

          let innerTry = 0
          while(innerTry < 2) {
            innerTry++
            solutions.push(...freeSpace.solutions)
            if (freeSpace.tryDeeper !== undefined) {
              freeSpace = freeSpace.tryDeeper()
            }
            else break
          }

          if (!(innerTry < 2)) callAgainLs[i] = freeSpace.tryDeeper as any
          
        }

        if (!solutions.empty) {
          // weight solutions by distance from original position
          const originalPos = page.getScaledPos()
          solutions.sort((a, b) => {
            const aDist = Math.hypot(a.left - originalPos.x, a.top - originalPos.y)
            const bDist = Math.hypot(b.left - originalPos.x, b.top - originalPos.y)
            return aDist - bDist
          })
          const bestSolution = solutions.first
          return setToPage(bestSolution.left, bestSolution.top)
        }
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


      
  private canvasees = [] as PositionalHTMLElement[]

  private addedPagesCount = 0
  private absZData = new Data(1)
  private appendPageToCanvas(...pages: HTMLElement[]) {
    pages.forEach(page => {
      if ("disableContentVisibilityOptimisation" in (page as SectionedPage)) (page as SectionedPage).disableContentVisibilityOptimisation()



      const d = new Data("hello")
      d.get(() => {
        throw new UrlDuplicateError()
      }, false)

      
      

      const frame = new PageFrame(page, d, localSettings("pageFrame" + this.addedPagesCount, {x: 200 + 1700 * this.addedPagesCount, y: 300}), this.absZData, this.normalizedWidthData, this.addNoScaleBoundAddon.bind(this))

      setTimeout(() => {
        frame.css({zIndex: Math.floor(frame.getScaledY() / this.body.canvas.height() * maxZIndex)})
      })
      frame.currentlyMoving.get(async (moving) => {
        if (moving) {
          frame.css({zIndex: maxZIndex})
        }
        else {
          await this.ensurePageIsInFreeSpace(frame)
          frame.css({zIndex: Math.floor(frame.getScaledY() / this.body.canvas.height() * maxZIndex)})
        }
      }, false)
      
      this.forceAppendToCanvas(frame)


      this.addedPagesCount++

      
      this.addNoScaleAddons(frame.heading)
      // @ts-ignore
      frame.heading.css({
        transformOrigin: "left bottom",
        willChange: "transform"
      })
      return frame
    })
  }
  private forceAppendToCanvas(...anything: PositionalHTMLElement[]) {
    this.canvasees.push(...anything)
    this.body.canvas.apd(...anything)
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



    const abs = clone(adminPos()) as {
      x: number;
      y: number;
      z: number;
      zoomOffset: {
          x: number;
          y: number;
      }
    }

    const container = this.body.canvasContainer as HTMLElement
    const target = this.body.moveArea as HTMLElement
    const canvas = target.children[0] as HTMLElement

    const canvasDimensions = {
      width: 15000,
      height: 15000
    }

    const borderSize = 10000

    canvas.css({
      minWidth: canvasDimensions.width,
      minHeight: canvasDimensions.height,
    })

    

    function addPositionalHTMLElementApiWrapperFromPos(elem: HTMLElement, pos: DataBase<{x: number, y: number}>) {
      // @ts-ignore
      elem.getScaledPos = () => {
        return pos()
      }

      // @ts-ignore
      elem.addUnscaledY = (y: number) => {
        pos.y.set(y + pos.y.get())
      }

      // @ts-ignore
      elem.addUnscaledX = (x: number) => {
        pos.x.set(x + pos.x.get())
      }

      // @ts-ignore
      elem.getScaledX = () => {
        return pos.x.get()
      }

      // @ts-ignore
      elem.getScaledY = () => {
        return pos.y.get()
      }


      return elem as PositionalHTMLElement
    }




    setTimeout(() => {
      const topBorderPos = new DataBase({x: 0, y: -borderSize + minDistanceTop})
      const topBorder = addPositionalHTMLElementApiWrapperFromPos(
        ce("border-box").addClass("top"),
        topBorderPos
      )
      topBorder.css({
        width: "100%",
        height: borderSize,
      })
      const margin = this.getMargin()
      this.absZData.get((z) => {
        topBorderPos.y.set(-borderSize + (minDistanceTop / z + minDistanceTop) - margin.top - margin.bottom)
      })
  
      const bottomBorder = addPositionalHTMLElementApiWrapperFromPos(
        ce("border-box").addClass("bottom"),
        new DataBase({x: 0, y: canvasDimensions.height})
      )
      bottomBorder.css({
        width: "100%",
        height: borderSize
      })
  
      console.log("this", this.width())
  
      const leftBorder = addPositionalHTMLElementApiWrapperFromPos(
        ce("border-box").addClass("left"),
        new DataBase({x: -borderSize / this.width() * holyWidthDivider, y: 0})
      )
      leftBorder.css({
        width: borderSize,
        height: "100%"
      })
  
  
      const rightBorder = addPositionalHTMLElementApiWrapperFromPos(
        ce("border-box").addClass("right"),
        new DataBase({x: canvasDimensions.width / this.width() * holyWidthDivider, y: 0})
      )
      rightBorder.css({
        width: borderSize,
        height: "100%"
      })
  

      this.forceAppendToCanvas(
        topBorder,
        bottomBorder,
        leftBorder,
        rightBorder
      )
  
    })
   

    

    this.appendPageToCanvas(
      ce("test-box").apd("1"),
      ce("test-box").apd("2"),
      ce("test-box").apd("3"),
      ce("test-box").apd("4"),
      ce("test-box").apd("5"),
      ce("test-box").apd("6"),
      ce("test-box").apd("7")
    )



    






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
        if (canvas.width() * abs.z < target.width()) {
          const maxZ = target.width() / canvas.width()
          zoom = maxZ / abs.z
          abs.z = maxZ
        }
        if (canvas.height() * abs.z < target.height()) {
          const maxZ = target.height() / canvas.height()
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
        // zoom touch

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


    



    animationFrameDelta(() => {

      // smooths the panning by approaching the target coordinates (abs)
      // console.log(cappedSmooth(abs.y, renderedCoords.y))
      
      // renderedCoords.x += cappedSmooth(abs.x, renderedCoords.x)
      // renderedCoords.y += cappedSmooth(abs.y, renderedCoords.y)
      // renderedCoords.z += smooth(abs.z, renderedCoords.z)
      // renderedCoords.zoomOffset.x += smooth(abs.zoomOffset.x, renderedCoords.zoomOffset.x)
      // renderedCoords.zoomOffset.y += smooth(abs.zoomOffset.y, renderedCoords.zoomOffset.y)



      // reevaluate if the above is neccecary (maybe on desktop...), but if so may there be another way to do it. If not, we should consider the hypot delta and not x and y coords indicidually
      renderedCoords.x = abs.x
      renderedCoords.y = abs.y
      renderedCoords.z = abs.z
      renderedCoords.zoomOffset.x = abs.zoomOffset.x
      renderedCoords.zoomOffset.y = abs.zoomOffset.y

      
      let x = renderedCoords.x - renderedCoords.zoomOffset.x
      let y = renderedCoords.y - renderedCoords.zoomOffset.y
      const z = renderedCoords.z

      const w = x - target.width() + canvas.width() * z
      const h = y - target.height() + canvas.height() * z
      
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
      this.absZData.set(z)

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
        
        if (-x * invZ > myX) localX = -x * invZ
        if (-y * invZ > myY) localY = -y * invZ

        // consider scale
        if (-x + target.width() < myX * z + addon.width()) localX = (-x + target.width() - addon.width()) * invZ

        
        addon.css({
          scale: invZ,
          translateX: localX,
          translateY: localY
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
