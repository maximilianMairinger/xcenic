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
import RegistrationPage from "../../_manager/registrationPage/registrationPage"
import Page from "../../_page/page";



export default class PageManager extends Manager {
  constructor(pageChangeCallback?: (page: Page, sectiones: {[link: string]: HighlightAbleIcon}[], domainLevel: number, pageName: string) => void, sectionChangeCallback?: (section: string) => void, onScroll?: (scrollProgress: number) => void, onUserScroll?: (scrollProgress: number, userInited: boolean) => void) {

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
        key: new Import("register", 10, (registrationPage: typeof RegistrationPage) =>
            new registrationPage()
        ), val: () => import(/* webpackChunkName: "registrationPage" */"../../_manager/registrationPage/registrationPage")
      },
      {
        key: new Import("admin", 10, (adminPage: typeof AdminPage) => {
          const instance = new adminPage();

          const proxyFunc = (active: boolean) => {
            // make the url bar blurry no matter where we are
            if (active) setTimeout(() => {
              if (instance.active) onScroll(5)
            })
          }

          if ((instance as any).activationCallback) {
            const activationCallback = (instance as any).activationCallback.bind(instance);
            (instance as any).activationCallback = (active: boolean) => {
              proxyFunc(active)
              return activationCallback(active)
            }
          }
          else (instance as any).activationCallback = proxyFunc
          

          return instance
        }), val: () => import(/* webpackChunkName: "adminPage" */"../../_page/adminPage/adminPage")
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
    return super.stl() + require("./pageManager.css").toString()
  }
  pug() {
    return "";
  }
}


declareComponent("page-manager", PageManager)