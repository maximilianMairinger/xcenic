import delay from "tiny-delay"
import Component from "../component"
import declareComponent from "./../../lib/declareComponent"
import milliseconds from "milliseconds"


const rotationInDeg = -30
const barHeight = 0
console.log("barHeight", barHeight)
const barShadowSize = 50
console.log("barShadowSize", barShadowSize)



export default class LoadingBox extends Component<false> {
  
  private translateFor: number = 0
  constructor() {
    super()

    this.sra(ce("style").html(
      `swoosh-bar {
        height: ${barHeight}px;
        transform: rotate(${rotationInDeg}deg);
        box-shadow: 0 0 ${barShadowSize}px ${barShadowSize}px rgba(0,0,0,.1);
      }`
    ))

    
  }

  async swoosh(time: number = 2700) {
    const elem = ce("swoosh-container").apd(ce("swoosh-bar"))
    this.apd(elem)
    await delay(1000)

    await elem.anim({translateY: this.translateFor}, time)
    await delay(1000)
    elem.remove()
  }

  connectedCallback() {


    const myStyle = ce("style")
    this.sra(myStyle)


    this.resizeData().get(({width, height}) => {
      const cos = Math.cos(-rotationInDeg * Math.PI / 180)
      const sin = Math.sin(-rotationInDeg * Math.PI / 180)

      const elemWidth = (((barHeight + barShadowSize) * sin) + width) / cos

      const heightMainBody = sin * elemWidth

      const heightOverflow = cos * (barHeight + barShadowSize * 2)
      const projectedOuterHeight = heightMainBody + heightOverflow


      myStyle.html(
        `swoosh-bar {
          width: ${elemWidth}px;
          margin-left: -${elemWidth - width}px;
          margin-top: -${projectedOuterHeight}px;
        }`
      )

      this.translateFor = height + projectedOuterHeight + barShadowSize * 2
    })



    this.swoosh()
    setInterval(() => {
      this.swoosh()
    }, milliseconds.seconds(3))
  }
  


  stl() {
    return super.stl() + require("./loadingBox.css").toString()
  }

  pug() {
    return require("./loadingBox.pug").default
  }

}

declareComponent("loading-box", LoadingBox)