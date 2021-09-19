import declareComponent from "../../../../../../../lib/declareComponent"
import { Import, ImportanceMap } from "../../../../../../../lib/lazyLoad"
import PhilosophySection from "../../../../_pageSection/philosophySection/philosophySection"
import LandingSection from "../../../../_pageSection/landingSection/landingSection"
import WorkSection from "../../../../_pageSection/workSection/workSection"
import TeamSection from "../../../../_pageSection/teamSection/teamSection"
import ContactSection from "../../../../_pageSection/contactSection/contactSection"
import FooterSection from "../../../../_pageSection/footerSection/footerSection"
import LinesSection from "../../../../_pageSection/linesSection/linesSection"
import TestSection from "../../../../_pageSection/testSection/testSection"
import LazySectionedPage from "../lazySectionedPage"
import HightlightAbleIcon from "../../../../../_icon/_highlightAbleIcon/highlightAbleIcon"
import ThoughtBubbleIcon from "../../../../../_icon/_highlightAbleIcon/thoughtBubble/thoughtBubble"
import RocketIcon from "../../../../../_icon/_highlightAbleIcon/rocket/rocket"
import TeamIcon from "../../../../../_icon/_highlightAbleIcon/team/team"
import ContactIcon from "../../../../../_icon/_highlightAbleIcon/contact/contact"
import { AliasList, ScrollProgressAlias, ScrollProgressAliasIndex } from "../../sectionedPage"
import { Data } from "josm"



export default class HomePage extends LazySectionedPage {

  public iconIndex: {[key: string]: HightlightAbleIcon}

  constructor(baselink: string, changeNavTheme: (theme: string) => void, sectionChangeCallback?: (section: string) => void) {
    const subsectionHeight = [new Data(300), new Data(1600)]

    super(new ImportanceMap<() => Promise<any>, any>(
      // {
      //   key: new Import("", 1, (landingSection: typeof LandingSection) =>
      //     new landingSection()
      //   ), val: () => import(/* webpackChunkName: "landingSection" */"../../../../_pageSection/landingSection/landingSection")
      // },
      // {
      //   key: new Import("lines", 1, (linesSection: typeof LinesSection) => 
      //     new linesSection()
      //   ), val: () => import(/* webpackChunkName: "linesSection" */"../../../../_pageSection/linesSection/linesSection")
      // },
      // {
      //   key: new Import("philosophy", 1, (philosophySection: typeof PhilosophySection) =>
      //     new philosophySection()
      //   ), val: () => import(/* webpackChunkName: "philosophySection" */"../../../../_pageSection/philosophySection/philosophySection")
      // },
      // {
      //   key: new Import("services", 1, (workSection: typeof WorkSection) => {
      //     const sec = new workSection(changeNavTheme)
      //     for (let i = 0; i < sec.serviceSection.length -1; i++) {
      //       const subSec = sec.serviceSection[i];
      //       const heightData = subSec.resizeData().tunnel((rec) => rec.height)
      //       heightData.get(subsectionHeight[i].set.bind(subsectionHeight[i]), false)
      //     }

      //     return sec
      //   }), val: () => import(/* webpackChunkName: "workSection" */"../../../../_pageSection/workSection/workSection")
      // },
      {
        key: new Import("team", 1, (teamSection: typeof TeamSection) =>
          new teamSection()
        ), val: () => import(/* webpackChunkName: "teamSection" */"../../../../_pageSection/teamSection/teamSection")
      },
      {
        key: new Import("contact2", 1, (contactSection: typeof ContactSection) =>
          new contactSection()
        ), val: () => import(/* webpackChunkName: "contactSection" */"../../../../_pageSection/contactSection/contactSection")
      },
      {
        key: new Import("contact", 1, (footerSection: typeof FooterSection) =>
          new footerSection()
        ), val: () => import(/* webpackChunkName: "footerSection" */"../../../../_pageSection/footerSection/footerSection")
      },
      // {
      //   key: new Import("team2", 1, (testSection: typeof TestSection) =>
      //     new testSection()
      //   ), val: () => import(/* webpackChunkName: "testSection" */"../../../../_pageSection/testSection/testSection")
      // },
      // {
      //   key: new Import("team3", 1, (testSection: typeof TestSection) =>
      //     new testSection()
      //   ), val: () => import(/* webpackChunkName: "testSection" */"../../../../_pageSection/testSection/testSection")
      // },
      // {
      //   key: new Import("team4", 1, (testSection: typeof TestSection) =>
      //     new testSection()
      //   ), val: () => import(/* webpackChunkName: "testSection" */"../../../../_pageSection/testSection/testSection")
      // },
      // {
      //   key: new Import("team5", 1, (testSection: typeof TestSection) =>
      //     new testSection()
      //   ), val: () => import(/* webpackChunkName: "testSection" */"../../../../_pageSection/testSection/testSection")
      // },
    ), baselink, sectionChangeCallback, new AliasList(
      //@ts-ignore
      new ScrollProgressAliasIndex("services", [
        new ScrollProgressAlias(0, "services/websites"),
        new ScrollProgressAlias(subsectionHeight[0], "services/contentCreation"),
        new ScrollProgressAlias(subsectionHeight[1], "services/socialMedia")
      ])
    ), {
      // footer: "contact"
    })



    this.iconIndex = {
      philosophy: new ThoughtBubbleIcon(),
      services: new RocketIcon(),
      team: new TeamIcon(),
      contact: new ContactIcon()
    }
  }

  stl() {
    return super.stl() + require("./homepage.css").toString()
  }
  pug() {
    return require("./homepage.pug").default
  }
}

declareComponent("home-page", HomePage)
