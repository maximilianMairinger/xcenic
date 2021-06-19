import declareComponent from "../../../../../../../lib/declareComponent"
import { Import, ImportanceMap } from "../../../../../../../lib/lazyLoad"
import LandingSection from "../../../../_pageSection/landingSection/landingSection"
import LazySectionedPage from "../lazySectionedPage"

export default class HomePage extends LazySectionedPage {

  constructor(sectionChangeCallback?: (section: string) => void) {
    super(new ImportanceMap<() => Promise<any>, any>(
      {
        key: new Import("tagesschule", 1, (landingSection: typeof LandingSection) =>
          new landingSection()
        ), val: () => import(/* webpackChunkName: "LandingSection" */"../../../../_pageSection/landingSection/landingSection")
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