import declareComponent from "../../../../../../../lib/declareComponent"
import { Import, ImportanceMap } from "../../../../../../../lib/lazyLoad"
import LandingSection from "../../../../_pageSection/landingSection/landingSection"
import TestSection from "../../../../_pageSection/testSection/testSection"
import LazySectionedPage from "../lazySectionedPage"

export default class HomePage extends LazySectionedPage {

  constructor(sectionChangeCallback?: (section: string) => void) {
    super(new ImportanceMap<() => Promise<any>, any>(
      {
        key: new Import("", 1, (landingSection: typeof LandingSection) =>
          new landingSection()
        ), val: () => import(/* webpackChunkName: "LandingSection" */"../../../../_pageSection/landingSection/landingSection")
      },
      {
        key: new Import("test1", 1, (testSection: typeof TestSection) =>
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