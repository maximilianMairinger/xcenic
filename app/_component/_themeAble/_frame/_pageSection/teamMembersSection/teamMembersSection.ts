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

    this.nextEmployee()
    

    this.nextEmploeeBtn.click(() => {
      this.nextEmployee()
      this.rmLastEmployee()
    })
    

    
  }

  private lls = []

  private rmLastEmployee() {
    const { img, details } = this.lls.shift()
    delay(500).then(() => img.remove())
    delay(80).then(() => details.anim({
      opacity: 0,
      translateX: -15,
    }, 500).then(() => details.remove()))
  }

  private counter = 0
  private nextEmployee() {
    const data = teamMembers[this.counter % teamMembers.length]
    this.counter++
    
    const e = makeEntryDetailsElement(data)
    this.lls.add(e)

    e.img.css({
      opacity: 0,
      translateX: 25
    })
    e.details.css({
      opacity: 0,
      translateX: 25
    })


    this.imageContainer.apd(e.img)
    this.detailsBar.insertBefore(e.details, this.nextEmploeeBtn)

    delay(120).then(() => {
      e.img.anim({
        opacity: 1,
        translateX: .1
      }, 500)
      delay(80).then(() => e.details.anim({
        opacity: 1,
        translateX: .1
      }, 500))
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
