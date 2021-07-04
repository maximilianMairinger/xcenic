import declareComponent from "../../../../../../../lib/declareComponent"
import { Import, ImportanceMap } from "../../../../../../../lib/lazyLoad"
import PhilosophySection from "../../../../_pageSection/philosophySection/philosophySection"
import LandingSection from "../../../../_pageSection/landingSection/landingSection"
import TestSection from "../../../../_pageSection/testSection/testSection"
import LazySectionedPage from "../lazySectionedPage"
import HightlightAbleIcon from "../../../../../_icon/_highlightAbleIcon/highlightAbleIcon"
import ThoughtBubbleIcon from "../../../../../_icon/_highlightAbleIcon/thoughtBubble/thoughtBubble"
import RocketIcon from "../../../../../_icon/_highlightAbleIcon/rocket/rocket"
import TeamIcon from "../../../../../_icon/_highlightAbleIcon/team/team"
import ContactIcon from "../../../../../_icon/_highlightAbleIcon/contact/contact"



export default class HomePage extends LazySectionedPage {

  public iconIndex: {[key: string]: HightlightAbleIcon} = {
    philosophy: new ThoughtBubbleIcon(),
    services: new RocketIcon(),
    team: new TeamIcon(),
    contact: new ContactIcon()
  }

  constructor(sectionChangeCallback?: (section: string) => void) {
    super(new ImportanceMap<() => Promise<any>, any>(
      {
        key: new Import("", 1, (landingSection: typeof LandingSection) =>
          new landingSection()
        ), val: () => import(/* webpackChunkName: "landingSection" */"../../../../_pageSection/landingSection/landingSection")
      },
      {
        key: new Import("philosophy", 1, (philosophySection: typeof PhilosophySection) =>
          new philosophySection()
        ), val: () => import(/* webpackChunkName: "philosophySection" */"../../../../_pageSection/philosophySection/philosophySection")
      },
      {
        key: new Import("services", 1, (testSection: typeof TestSection) =>
          new testSection()
        ), val: () => import(/* webpackChunkName: "testSection" */"../../../../_pageSection/testSection/testSection")
      },
      {
        key: new Import("team", 1, (testSection: typeof TestSection) =>
          new testSection()
        ), val: () => import(/* webpackChunkName: "testSection" */"../../../../_pageSection/testSection/testSection")
      },
      {
        key: new Import("contact", 1, (testSection: typeof TestSection) =>
          new testSection()
        ), val: () => import(/* webpackChunkName: "testSection" */"../../../../_pageSection/testSection/testSection")
      }
    ), sectionChangeCallback)


  }

  stl() {
    return super.stl() + require("./homepage.css").toString()
  }
  pug() {
    return require("./homepage.pug").default
  }
}

declareComponent("home-page", HomePage)
