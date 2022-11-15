import Manager from "../manager";
import {ImportanceMap, Import} from "../../../../../lib/lazyLoad"
import NotFoundPage from "../../_page/notFound/notFound"
import HomePage from "../../_page/_sectionedPage/_lazySectionedPage/homepage/homepage";
import ContactPage from "../../_page/contactPage/contactPage";
import { declareComponent } from "../../../../../lib/declareComponent"
import HighlightAbleIcon from "../../../_icon/_highlightAbleIcon/highlightAbleIcon";
import LoginPage from "../../_page/loginPage/loginPage"
import AdminPage from "../../_page/adminPage/adminPage"
import PrivacyPage from "../../_page/_blogPage/privacyPage/privacyPage"
import LegalPage from "../../_page/_blogPage/legalPage/legalPage"



export default class PageManager extends Manager {
  constructor(pageChangeCallback?: (page: string, sectiones: {[link: string]: HighlightAbleIcon}[], domainLevel: number) => void, sectionChangeCallback?: (section: string) => void, onScroll?: (scrollProgress: number) => void, onUserScroll?: (scrollProgress: number, userInited: boolean) => void) {

    super(new ImportanceMap<() => Promise<any>, any>(
      
      {
        key: new Import("", 10, (homepage: typeof HomePage) =>
            new homepage("", sectionChangeCallback)
        ), val: () => import(/* webpackChunkName: "homepage" */"../../_page/_sectionedPage/_lazySectionedPage/homepage/homepage")
      },
      {
        key: new Import("privacy", 10, (termsPage: typeof PrivacyPage) =>
            new termsPage()
        ), val: () => import(/* webpackChunkName: "privacyPage" */"../../_page/_blogPage/privacyPage/privacyPage")
      },
      {
        key: new Import("legalNotice", 10, (legalPage: typeof LegalPage) =>
            new legalPage()
        ), val: () => import(/* webpackChunkName: "legalPage" */"../../_page/_blogPage/legalPage/legalPage")
      },
      {
        key: new Import("contact/form", 10, (contactPage: typeof ContactPage) =>
            new contactPage()
        ), val: () => import(/* webpackChunkName: "contactPage" */"../../_page/contactPage/contactPage")
      },
      {
        key: new Import("admin", 10, (adminPage: typeof AdminPage) =>
            new adminPage()
        ), val: () => import(/* webpackChunkName: "adminPage" */"../../_page/adminPage/adminPage")
      },
      {
        key: new Import("admin", 10, (loginPage: typeof LoginPage) =>
            new loginPage()
        ), val: () => import(/* webpackChunkName: "loginPage" */"../../_page/loginPage/loginPage")
      },
      {
        key: new Import("", 60, (notFoundPage: typeof NotFoundPage) =>
          new notFoundPage()
        ), val: () => import(/* webpackChunkName: "notFoundPage" */"../../_page/notFound/notFound")
      }
    ), 0, pageChangeCallback, true, onScroll, onUserScroll)
  }


  stl() {
    return super.stl() + require("./pageManager.css").default
  }
  pug() {
    return "";
  }
}


declareComponent("page-manager", PageManager)