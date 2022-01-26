import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../../image/image"
import "../../../_icon/heartIllustration/heartIllustration"
import "../../../_icon/dotAccent/dotAccent"
import IconArrowPointer from "../../../_icon/arrowPointer/arrowPointer"
import "../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import "./../../../_focusAble/_formUi/_rippleButton/rippleButton"
import RippleButton from "./../../../_focusAble/_formUi/_rippleButton/rippleButton"
import { Data } from "josm"
import Image from "../../../../image/image"
import delay from "delay"


const fadeInAnimOptions = {
  opacity: 1,
  translateX: .1
}

const fadeoutAnimOptions = {
  opacity: 0,
  translateX: -15
}

const smooth = false


function makeEntryDetailsElement(data: {name: string, role: string, imgSrc: string}) {
  const img = new Image(data.imgSrc)

  
  return {
    details: ce("details-entry").apd(
      ce("heading-elem").txt(data.name),
      ce("subtext-elem").txt(data.role),
    ),
    img
  }
}


const teamMembers = [
  {
    name: "José",
    role: "CEO",
    imgSrc: "person1"
  },
  {
    name: "Bard",
    role: "CTO",
    imgSrc: "person2"
  }
]



export default class TeamMemberSection extends PageSection {

  private scrollContainer = this.q("scroll-container") as HTMLElement
  private imageContainer = this.q("image-container")
  private detailsBar = this.q("details-bar") as HTMLElement
  private nextEmploeeBtn: RippleButton = this.detailsBar.childs("c-ripple-button")
  constructor() {
    super("light");
    this.accentTheme.set("secondary")

    const arrowIcon = new IconArrowPointer()
      
    arrowIcon.css({
      width: 20,
      height: "min-content",
      padding: 12
    })

    this.nextEmploeeBtn.append(arrowIcon)

    this.nextEmployeeAnimation()
    

    this.nextEmploeeBtn.click(() => {
      this.nextEmployeeAnimation()
      this.rmLastEmployee()
    })


    for (let i = 0; i < 10; i++) {
      this.addScrollElem()
    }

    const scrollElemWidth = 300
    this.sra(ce("style").html(`scroll-container>scrollmargin-element{width:${scrollElemWidth}px}`))


    let animGuide = new Data(0)
    const itr = new Data(0)
    
    this.scrollContainer.on("scroll", (e) => {
      const t = e.progress.x / (scrollElemWidth - 1)
      itr.set(Math.ceil(t))
      
      let animPos = t % 1
      animGuide.set(animPos)
    })

    
    let lastItr = itr.get()
    itr.get((itr) => {
      const forwards = itr >= lastItr // the euqal sign here is important

      let lastGuy: ReturnType<typeof makeEntryDetailsElement>
      if (!forwards) {
        console.log("extra")
        lastGuy = this.lls.pop()
        animGuide.set(0)
        animGuide = new Data(0)
        if (itr === 0) return
      }
      else {
        if (itr !== 1) {
          lastGuy = this.lls.shift()
        }
      }
      if (lastGuy) {
        setTimeout(() => {
          lastGuy.img.remove()
          lastGuy.details.remove()
        }, 200)
        
      }

      console.log(itr, forwards)
      animGuide.set(+forwards)
      const curElem = this.lls.first
      const nextElems = this.prepNewEmployeeElements(itr - (!forwards ? 1 : 0), forwards)
      nextElems.img.css({zIndex: 10})
      animGuide = new Data(+!forwards)

      const fadeInAnimKeyFrames = [{...fadeoutAnimOptions}, {...fadeInAnimOptions}] as any[]
      fadeInAnimKeyFrames.first.translateX *= (forwards ? -1 : 1)
      if (!forwards) fadeInAnimKeyFrames.reverse()
      fadeInAnimKeyFrames.first.offset = 0

      const fadeOutAnimKeyFrames = [{...fadeInAnimOptions}, {...fadeoutAnimOptions}] as any[]
      fadeOutAnimKeyFrames.last.translateX *= (!forwards ? -1 : 1)
      if (!forwards) fadeOutAnimKeyFrames.reverse()
      fadeOutAnimKeyFrames.first.offset = 0

      
      
      nextElems.img.anim(fadeInAnimKeyFrames, {start: 0, end: 1, smooth}, animGuide)
      nextElems.details.anim(fadeInAnimKeyFrames, forwards ? {start: 0.1, end: 1, smooth} : {start: 0, end: .9, smooth}, animGuide)
      curElem.details.anim(fadeOutAnimKeyFrames, forwards ? {start: 0, end: .6, smooth} : {start: .4, end: 1, smooth}, animGuide)



      lastItr = itr
    }, false)
    
  }

  private addScrollElem() {
    this.scrollContainer.apd(ce("scrollmargin-element"))
  }

  private lls = [] as ReturnType<typeof makeEntryDetailsElement>[]

  private rmLastEmployee() {
    const { img, details } = this.lls.shift()
    delay(500).then(() => img.remove())
    delay(80).then(() => details.anim(fadeoutAnimOptions, 500).then(() => details.remove()))
  }


  private prepNewEmployeeElements(count: number, beginOrEnd: boolean = true) {
    const data = teamMembers[count % teamMembers.length]

    const e = makeEntryDetailsElement(data)
    if (beginOrEnd) this.lls.add(e)
    else this.lls.unshift(e)

    const begEndFac = !beginOrEnd ? 1 : -1
    const styles = {...fadeoutAnimOptions}
    styles.translateX = -begEndFac * 15
    
    e.img.css(styles)
    e.details.css(styles)
    


    this.imageContainer.apd(e.img)
    this.detailsBar.insertBefore(e.details, this.nextEmploeeBtn)

    return e
  }



  private count = 0
  private nextEmployeeAnimation() {
    
    const { img, details } = this.prepNewEmployeeElements(this.count)
    this.count++


    delay(120).then(() => {
      img.anim(fadeInAnimOptions, 500)
      delay(80).then(() => details.anim(fadeInAnimOptions, 500))
    })

    

  }

  stl() {
    return super.stl() + require("./teamMembersSection.css").toString()
  }
  pug() {
    return require("./teamMembersSection.pug").default
  }
}

declareComponent("team-members-section", TeamMemberSection)
