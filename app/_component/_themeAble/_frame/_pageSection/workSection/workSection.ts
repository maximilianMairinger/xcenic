import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../textBlob/textBlob"
import "../../../_icon/line/line"
import "../../../_icon/tagAccent/tagAccent"
import "../../../_icon/dotAccent/dotAccent"
import "../../../../image/image"
import "../../../_icon/tgmLogoDots/tgmLogoDots"
import "../../../_icon/versionControl/versionControl"
import "../../../_icon/photoShoot/photoShoot"
import "../../../_icon/socialMedia/socialMedia"
import { ElementList } from "extended-dom"
import { Data, DataCollection } from "josm"

export default class PhilosophySection extends PageSection {
  public serviceSection = this.q("service-showcase") as ElementList<HTMLElement>
  constructor(changeNavTheme: (theme: string) => void) {
    super("light")


    let prevHeight = new Data<number>(0)
    let toggleBool = true

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

      const localToggleBool = toggleBool
      this.localScrollProgressData(.4).then((scrollData) => {
        const scrollTrigger = scrollData.scrollTrigger(height)

        scrollTrigger.on(localToggleBool ? "forward" : "backward", () => {
          this.css("backgroundColor", "#FFFAFA")
          this.style.setProperty("--theme", "var(--secondary-theme)")
          changeNavTheme("var(--secondary-theme)")
        })
  
        scrollTrigger.on(!localToggleBool ? "forward" : "backward", () => {
          this.css("backgroundColor", "#F9FAFE")
          this.style.setProperty("--theme", "var(--primary-theme)")
          changeNavTheme("var(--primary-theme)")
        })
      })


      
      toggleBool = !toggleBool
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
