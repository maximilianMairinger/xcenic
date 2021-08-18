import Manager from "../manager";
import {ImportanceMap, Import} from "../../../../../lib/lazyLoad"
import NotFoundPage from "../../_page/notFound/notFound"
import HomePage from "../../_page/_sectionedPage/_lazySectionedPage/homepage/homepage";
import ContactPage from "../../_page/contactPage/contactPage";
import { declareComponent } from "../../../../../lib/declareComponent"
import HighlightAbleIcon from "../../../_icon/_highlightAbleIcon/highlightAbleIcon";



export default class PageManager extends Manager {
  constructor(changeNavTheme: (theme: string) => void, pageChangeCallback?: (page: string, sectiones: {[link: string]: HighlightAbleIcon}[], domainLevel: number) => void, sectionChangeCallback?: (section: string) => void, onUserScroll?: (scrollProgress: number, userInited: boolean) => void, onScroll?: (scrollProgress: number) => void) {

    super(new ImportanceMap<() => Promise<any>, any>(
      
      {
        key: new Import("", 10, (homepage: typeof HomePage) =>
            new homepage("", changeNavTheme, sectionChangeCallback)
        ), val: () => import(/* webpackChunkName: "homepage" */"../../_page/_sectionedPage/_lazySectionedPage/homepage/homepage")
      },
      {
        key: new Import("contact/form", 10, (contactPage: typeof ContactPage) =>
            new contactPage()
        ), val: () => import(/* webpackChunkName: "contactPage" */"../../_page/contactPage/contactPage")
      },
      {
        key: new Import("", 60, (notFoundPage: typeof NotFoundPage) =>
          new notFoundPage()
        ), val: () => import(/* webpackChunkName: "notFoundPage" */"../../_page/notFound/notFound")
      }
    ), 0, pageChangeCallback, true, onUserScroll, onScroll)
  }


  stl() {
    return super.stl() + require("./pageManager.css").toString()
  }
  pug() {
    return "";
  }
}


declareComponent("page-manager", PageManager)