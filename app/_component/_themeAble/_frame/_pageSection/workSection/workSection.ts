import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../textBlob/textBlob"
import "../../../_icon/line/line"
import "../../../_icon/tagAccent/tagAccent"
import "../../../_icon/dotAccent/dotAccent"
import "../../../../image/image"
import "../../../_icon/tgmLogoDots/tgmLogoDots"
import "../../../_icon/versionControl/versionControl"
import { ElementList } from "extended-dom"
import { Data, DataCollection } from "josm"

export default class PhilosophySection extends PageSection {
  private serviceSection = this.q("service-showcase") as ElementList<HTMLElement>
  constructor() {
    super("light")


    let prevHeight = new Data<number>(0)

    for(let i = 0; i < this.serviceSection.length - 1; i++) {
      const service = this.serviceSection[i]
      const height = new Data<number>()
      const localHeight = new Data(0)
      service.on("resize", (e) => {
        localHeight.set(e.height)
      })
      new DataCollection(prevHeight, localHeight).get((prevHeight, localHeight) => {
        height.set(prevHeight + localHeight)
      })

      this.localScrollProgressData("center").then((scrollData) => {
        const scrollTrigger = scrollData.scrollTrigger(height)

        scrollTrigger.on("forward", () => {
          console.log("forward", service)
        })
  
        scrollTrigger.on("backward", () => {
          console.log("backward", service)
        })
      })


      

      prevHeight = height
    }


  }

  stl() {
    return super.stl() + require("./workSection.css").toString()
  }
  pug() {
    return require("./workSection.pug").default
  }
}

declareComponent("work-section", PhilosophySection)
