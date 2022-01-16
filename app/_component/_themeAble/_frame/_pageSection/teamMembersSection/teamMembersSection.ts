import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../_icon/heartIllustration/heartIllustration"
import "../../../_icon/dotAccent/dotAccent"
import "../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"




export default class TeamMemberSection extends PageSection {

  constructor() {
    super("light");



    
  }

  stl() {
    return super.stl() + require("./teamMembersSection.css").toString()
  }
  pug() {
    return require("./teamMembersSection.pug").default
  }
}

declareComponent("team-members-section", TeamMemberSection)
