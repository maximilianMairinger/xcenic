import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../../image/image"
import "../../../_icon/heartIllustration/heartIllustration"
import "../../../_icon/dotAccent/dotAccent"
import IconArrowPointer from "../../../_icon/arrowPointer/arrowPointer"
import "../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import "./../../../_focusAble/_formUi/_rippleButton/rippleButton"
import RippleButton from "./../../../_focusAble/_formUi/_rippleButton/rippleButton"



export default class TeamMemberSection extends PageSection {

  private nextEmploeeBtn: RippleButton = this.q("details-bar c-ripple-button")
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


    
  }

  stl() {
    return super.stl() + require("./teamMembersSection.css").toString()
  }
  pug() {
    return require("./teamMembersSection.pug").default
  }
}

declareComponent("team-members-section", TeamMemberSection)
