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
import "../../../_icon/laptopWalkIllustration/laptopWalkIllustration"
import "../../../_icon/youtubeIllustration/youtubeIllustration"
import "../../../_icon/laptopNotificationIllustration/laptopNotificationIllustration"
import "../../../_focusAble/_formUi/_rippleButton/rippleButton"
import "../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import { ElementList, ScrollData, ScrollTrigger } from "extended-dom"
import { Data, DataCollection, DataSubscription } from "josm"
import delay from "delay"



const inactiveClass = "inactive"

export default class PhilosophySection extends PageSection {
  public serviceSection = this.q("service-showcase") as ElementList<HTMLElement>
  constructor() {
    super("light")


    
    let scrollTriggers: Promise<ScrollTrigger>[] = []
    let prevHeight = new Data<number>(0)
    let toggleBool = true

    const sidePanelElems = this.q(`view-more-side-panel showcase-section`) as ElementList<HTMLElement>


    
    let curTokenDac: Symbol
    function deactivateSidePanel(atIndex: number) {
      const panel = sidePanelElems[atIndex]
      if (panel === undefined) return
      const locToken = curTokenDac = Symbol()
      panel.removeClass("animdone")
      panel.anim({height: atIndex === sidePanelElems.length-1 ? 65 : 90}, 500).then(() => {
        if (locToken !== curTokenDac) return
        panel.addClass("animdone")
      })
      panel.addClass(inactiveClass)
      
    }

    let curTokenAc: Symbol
    
    async function activateSidePanel(atIndex: number) {
      const panel = sidePanelElems[atIndex]
      if (panel === undefined) return
      panel.removeClass(inactiveClass)
      
      const locToken = curTokenAc = Symbol()
      panel.anim([{height: atIndex === sidePanelElems.length-1 ? 65 : 90, offset: 0}, {height: panel.childs(":last-child").offsetBottom()}], {duration: 500, fill: true}).then(() => {
        if (curTokenAc !== locToken) return 
        panel.css({height: "fit-content"})
      })
    }



    for(let ii = 0; ii < this.serviceSection.length - 1; ii++) {
      const i = ii
      const service = this.serviceSection[i]
      const height = new Data<number>()
      const localHeight = new Data(0)
      service.on("resize", (e) => {
        localHeight.set(e.height)
      })
      new DataCollection(prevHeight, localHeight).get((prevHeight, localHeight) => {
        height.set(prevHeight + localHeight)
      })

      scrollTriggers.add(new Promise(async (res) => {
        const scrollData = await this.localScrollProgressData(.4)
        res(scrollData.scrollTrigger(height))
      }))
      prevHeight = height
    }

    
    
    
    Promise.all(scrollTriggers).then((scrollTriggers) => {

      const activeStageIndex = new Data(0)

      const changeThemeFuncIndex = {
        odd: () => {
          this.css("backgroundColor", "#FFFAFA")
          this.style.setProperty("--theme", "var(--secondary-theme)")
          this.accentTheme.set("secondary")
        },
        even: () => {
          this.css("backgroundColor", "#F9FAFE")
          this.style.setProperty("--theme", "var(--primary-theme)")
          this.accentTheme.set("primary")
        }
      }


      let lastActiveStageIndex = activeStageIndex.get()
      activeStageIndex.get((index) => {
        activateSidePanel(index)
        deactivateSidePanel(lastActiveStageIndex)

        changeThemeFuncIndex[index % 2 === 0 ? "even" : "odd"]()

        lastActiveStageIndex = index
      }, false)


      


      for (let ii = 0; ii < scrollTriggers.length; ii++) {
        const i = ii
        const nextI = ii + 1
        scrollTriggers[ii].on("forward", () => {
          activeStageIndex.set(nextI)
        })
        scrollTriggers[ii].on("backward", () => {
          activeStageIndex.set(i)
        })
      }

      

    })


  }

  stl() {
    return super.stl() + require("./workSection.css").toString()
  }
  pug() {
    return require("./workSection.pug").default
  }
}

declareComponent("work-section", PhilosophySection)



