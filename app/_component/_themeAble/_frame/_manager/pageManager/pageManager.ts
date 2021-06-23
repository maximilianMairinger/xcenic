import Manager from "../manager";
import {ImportanceMap, Import} from "../../../../../lib/lazyLoad"
import NotFoundPage from "../../_page/notFound/notFound"
import HomePage from "../../_page/_sectionedPage/_lazySectionedPage/homepage/homepage";
import { declareComponent } from "../../../../../lib/declareComponent"



export default class PageManager extends Manager {
  constructor(pageChangeCallback?: (page: string, sectiones: string[], domainLevel: number) => void, sectionChangeCallback?: (section: string) => void, onScrollBarWidthChange?: (scrollBarWidth: number) => void, onUserScroll?: (scrollProgress: number, userInited: boolean) => void, onScroll?: (scrollProgress: number) => void) {

    super(new ImportanceMap<() => Promise<any>, any>(
      
      {
        key: new Import("", 10, (homepage: typeof HomePage) =>
            new homepage(sectionChangeCallback)
        ), val: () => import(/* webpackChunkName: "homepage" */"../../_page/_sectionedPage/_lazySectionedPage/homepage/homepage")
      },
      {
        key: new Import("", 60, (notFoundPage: typeof NotFoundPage) =>
          new notFoundPage()
        ), val: () => import(/* webpackChunkName: "notFoundPage" */"../../_page/notFound/notFound")
      }
    ), 0, pageChangeCallback, true, onScrollBarWidthChange, onUserScroll, onScroll)
  }


  stl() {
    return super.stl() + require("./pageManager.css").toString()
  }
  pug() {
    return "";
  }
}


declareComponent("page-manager", PageManager)