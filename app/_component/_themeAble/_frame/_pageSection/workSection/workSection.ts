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
import "../../../_button/_rippleButton/rippleButton"
import "../../../_button/_rippleButton/blockButton/blockButton"
import { ElementList, ScrollData, ScrollTrigger } from "extended-dom"
import { Data, DataCollection } from "josm"
import delay from "delay"



const inactiveClass = "inactive"

export default class PhilosophySection extends PageSection {
  public serviceSection = this.q("service-showcase") as ElementList<HTMLElement>
  constructor(changeNavTheme: (theme: string) => void) {
    super("light")


    
    let scrollTriggers: Promise<ScrollTrigger>[] = []
    let prevHeight = new Data<number>(0)
    let toggleBool = true

    const sidePanelElems = this.q(`view-more-side-panel showcase-section`) as ElementList<HTMLElement>


    
    let curTokenDac: Symbol
    function deactivateSidePanel(atIndex: number) {
      const panel = sidePanelElems[atIndex]
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
      panel.removeClass(inactiveClass)
      
      const locToken = curTokenAc = Symbol()
                                                                      // why is this 13 here?
      panel.anim([{height: atIndex === sidePanelElems.length-1 ? 65 : 90, offset: 0}, {height: panel.childs(":last-child").offsetBottom() - 13}], {duration: 500, fill: true}).then(() => {
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

      


      for (let ii = 0; ii < scrollTriggers.length; ii++) {
        const i = ii
        const scrollTrigger = scrollTriggers[i]

        


        const localToggleBool = toggleBool


        

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


        


        const nextI = i + 1
        scrollTrigger.on("backward", () => {
          deactivateSidePanel(nextI)
        })

        
        scrollTrigger.on("forward", () => {
          deactivateSidePanel(i)
        })
          
        scrollTrigger.on("backward", () => {
          activateSidePanel(i)
        })

        scrollTrigger.on("forward", () => {
          activateSidePanel(nextI)
        })
   
  
        toggleBool = !toggleBool
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



