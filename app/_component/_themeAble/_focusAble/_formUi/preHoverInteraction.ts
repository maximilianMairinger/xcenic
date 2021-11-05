import FormUi from "./formUi";
import animationFrame from "animation-frame-delta";
import Easing from "waapi-easing"

const easeOut = new Easing("easeOut").function


const maxPxPerFrame = 2
// const overShootFactor = 1.05
const overShoot = 6

export default function(t: FormUi) {

  const target = t.q("prehover-detector") as HTMLElement
  // target.css({scale: overShootFactor})
  // const overShootX = t.offsetWidth * (overShootFactor-1) / 2;
  // const overShootY = t.offsetHeight * (overShootFactor-1) / 2;

  let renderedX = 0
  let renderedY = 0

  let relX = 0
  let relY = 0


  let maxX: number
  let maxY: number

  target.on("resize", (e: DOMRectReadOnly) => {
    maxX = e.width / 2
    maxY = e.height / 2
  })


  let leaveMaxX: number

  target.on("mouseleave", () => {
    leaveMaxX = renderedX
    relX = relY = 0
    followRuntime.cancel()
    snapBackRuntime.resume()
  })

  target.on("mouseenter", () => {
    snapBackRuntime.cancel()
    followRuntime.resume()
  })
  
  
  

  
  const followRuntimeFunc = (delta: number) => {
    const diffX = relX - renderedX
    const diffY = relY - renderedY

    const fac = Math.min(1, (maxPxPerFrame * delta) / Math.sqrt(diffX**2 + diffY**2))

    renderedX += diffX * fac
    renderedY += diffY * fac



    t.css({translateX: renderedX, translateY: renderedY})
    target.css({translateX: -renderedX, translateY: -renderedY})
  }


  const followRuntime = animationFrame(followRuntimeFunc)
  followRuntime.cancel(followRuntimeFunc)
  // let currentlyActiveRuntime = followRuntime
  const snapBackRuntime = animationFrame((delta: number) => {
    const diffX = 0 - renderedX
    const diffY = 0 - renderedY

    const prog = .9999 - (renderedX / leaveMaxX)
    const easeProgFac = easeOut(prog) / prog
    console.log("easeProgFac", easeProgFac)

    const fac = Math.min(1, (maxPxPerFrame * delta) / Math.sqrt(diffX**2 + diffY**2))
    const facc = fac * easeProgFac

    renderedX += diffX * facc
    renderedY += diffY * facc

    t.css({translateX: renderedX, translateY: renderedY})
    target.css({translateX: -renderedX, translateY: -renderedY})

    if (fac === 1) snapBackRuntime.cancel()
  })
  snapBackRuntime.cancel()


  target.on("mousemove", (e: MouseEvent) => {
    const absX = e.offsetX - maxX
    const absY = e.offsetY - maxY

    relX = easeOut(absX / maxX) * overShoot
    relY = easeOut(absY / maxY) * overShoot

  })
}
