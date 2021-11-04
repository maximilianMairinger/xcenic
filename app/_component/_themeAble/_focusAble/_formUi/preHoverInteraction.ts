import FormUi from "./formUi";
import { stats, nextFrame } from "animation-frame-delta";


const maxPxPerFrame = .2;
// const overShootFactor = 1.05
const overShoot = 5

export default function(t: FormUi) {

  const target = t.q("prehover-detector")
  // target.css({scale: overShootFactor})
  // const overShootX = t.offsetWidth * (overShootFactor-1) / 2;
  // const overShootY = t.offsetHeight * (overShootFactor-1) / 2;

  let renderedX = 0
  let renderedY = 0

  let relX = 0
  let relY = 0



  const followRuntime = () => {
    const diffX = relX - renderedX
    const diffY = relY - renderedY

    const cappedX = Math.min(diffX / stats.delta, maxPxPerFrame) * stats.delta
    const cappedY = Math.min(diffY / stats.delta, maxPxPerFrame) * stats.delta

    renderedX += cappedX
    renderedY += cappedY

    t.css({translateX: renderedX, translateY: renderedY})
    target.css({translateX: -renderedX, translateY: -renderedY})
    

    if (cappedX / stats.delta === maxPxPerFrame || cappedY / stats.delta === maxPxPerFrame) nextFrame(nextFrameRuntime)
  }

  const nextFrameRuntime = () => {
    if (mouseMoveThisFrame) mouseMoveThisFrame = false
    else {
      console.log("nextFrameRuntime")
      followRuntime()
    }
  }

  let mouseMoveThisFrame = false

  const mouseMoveRuntime = (e: MouseEvent) => {
    mouseMoveThisFrame = true


    const maxX = target.css("width") / 2
    const maxY = target.css("height") / 2


    const absX = e.offsetX - maxX
    const absY = e.offsetY - maxY

    relX = absX / maxX * overShoot
    relY = absY / maxY * overShoot

    followRuntime()
  }

  target.on("mousemove", mouseMoveRuntime)
}
