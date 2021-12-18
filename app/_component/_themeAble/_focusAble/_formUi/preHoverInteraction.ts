import FormUi from "./formUi";
import animationFrame from "animation-frame-delta";
import Easing from "waapi-easing"

const dragImpactEaseFunc = new Easing("easeIn").function

// let i = 0
// const getColor = () => {
//   i++
//   if (i % 3 === 0) {
//     return "red"
//   }
//   if (i % 3 === 1) {
//     return "green"
//   }
//   return "blue"
// }

const maxPxPerFrame = 1.25
// const overShootFactor = 1.05
const overShoot = 11

export default function(root: HTMLElement, target: HTMLElement, moveElement: HTMLElement) {

  

  // target.css({backgroundColor: getColor()});



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
    relX = relY = 0

    root.css({zIndex: 6})

    target.css({
      left: -10,
      top: -10,
      width: "calc(100% + 20px)",
      height: "calc(100% + 20px)",
      zIndex: 1,
    })
    maxX = target.width() / 2
    maxY = target.height() / 2

    followRuntime.cancel()
    snapBackRuntime.resume()
  })




  target.on("mouseenter", (e) => {
    root.css({zIndex: -1})

    target.css({
      left: -30,
      top: -30,
      width: "calc(100% + 60px)",
      height: "calc(100% + 60px)",
      zIndex: 3
    })
    maxX = target.width() / 2
    maxY = target.height() / 2

    const absX = e.offsetX - maxX
    const absY = e.offsetY - maxY

    relX = dragImpactEaseFunc(absX / maxX) * overShoot
    relY = dragImpactEaseFunc(absY / maxY) * overShoot

    snapBackRuntime.cancel()
    followRuntime.resume()
  })

  root.on("mouseenter", () => {
    root.css({zIndex: -1})
    target.css({
      zIndex: 3
    })
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

    let fac = Math.min(1, (speed * delta) / curDistance)
    if (isNaN(fac)) fac = 0

    renderedX += diffX * fac
    renderedY += diffY * fac



    moveElement.css({translateX: renderedX, translateY: renderedY})
  }


  const followRuntime = animationFrame(followRuntimeFunc)
  followRuntime.cancel()
  // let currentlyActiveRuntime = followRuntime
  const snapBackRuntime = animationFrame((delta: number) => {
    followRuntimeFunc(delta)

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
