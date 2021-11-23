import FormUi from "./formUi";
import animationFrame from "animation-frame-delta";
import Easing from "waapi-easing"

const dragImpactEaseFunc = new Easing("easeIn").function


let c = 0
const maxPxPerFrame = 1
// const overShootFactor = 1.05
const overShoot = 10

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


  target.on("mouseleave", () => {
    console.log("leave")
    relX = relY = 0

    t.css({zIndex: 2})
    target.css({
      left: -10,
      top: -10,
      width: "calc(100% + 20px)",
      height: "calc(100% + 20px)",
    })
    maxX = target.width() / 2
    maxY = target.height() / 2

    followRuntime.cancel()
    debugger
    snapBackRuntime.resume()
  })

  

  target.on("mouseenter", () => {
    console.log("enter")
    t.css({zIndex: 20})
    target.css({
      left: -30,
      top: -30,
      width: "calc(100% + 60px)",
      height: "calc(100% + 60px)",
    })
    maxX = target.width() / 2
    maxY = target.height() / 2

    c++
    if (c === 2) debugger

    snapBackRuntime.cancel()
    followRuntime.resume()
  })
  
  
  

  let maxDistance = 0
  let curDistance = 0
  const followRuntimeFunc = (delta: number) => {
    const diffX = relX - renderedX
    const diffY = relY - renderedY

    curDistance = Math.sqrt(diffX**2 + diffY**2)

    if (maxDistance < curDistance) {
      maxDistance = curDistance
    }

    const speed = curDistance / maxDistance * maxPxPerFrame

    const fac = Math.min(1, (speed * delta) / curDistance)

    renderedX += diffX * fac
    renderedY += diffY * fac



    t.css({translateX: renderedX, translateY: renderedY})
    target.css({translateX: -renderedX, translateY: -renderedY})
  }


  const followRuntime = animationFrame(followRuntimeFunc)
  followRuntime.cancel()
  // let currentlyActiveRuntime = followRuntime
  const snapBackRuntime = animationFrame((delta: number) => {
    followRuntimeFunc(delta)
    console.log("snap")

    if (curDistance < .4) snapBackRuntime.cancel()
  })
  snapBackRuntime.cancel()


  target.on("mousemove", (e: MouseEvent) => {
    const absX = e.offsetX - maxX
    const absY = e.offsetY - maxY

    relX = dragImpactEaseFunc(absX / maxX) * overShoot
    relY = dragImpactEaseFunc(absY / maxY) * overShoot

  })
}
