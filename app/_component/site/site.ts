import Component from "../component"
import declareComponent from "../../lib/declareComponent"
import PageManager from "./../_themeAble/_frame/_manager/pageManager/pageManager"
import lang from "../../lib/lang"
import LowerNav from "../_themeAble/lowerNav/lowerNav"
import Header from "../_themeAble/header/header"
import { dirString } from "../../lib/domain"
import { ElementList } from "extended-dom"
import HighlightAbleIcon from "../_themeAble/_icon/_highlightAbleIcon/highlightAbleIcon"
import { Data, DataSubscription } from "josm"
import { linkRecord } from "../_themeAble/link/link"
import { Theme } from "../_themeAble/themeAble"


const topLimit = 0
const topLimitForBlockingInteractions = 55
const scrollTrendActivationCount = 20

// intentionally never resolve those
linkRecord.record()

export default class Site extends Component {

  constructor() {
    super()


    


    
    

    let lowerNav = new LowerNav()
    let currentlyShowingLowerNav: boolean


    let header = new Header(async (hide, init, func) => {
      if (hide) {
        
        currentlyShowingLowerNav = false

        await lowerNav.disable(init, func)

      }
      else {
        currentlyShowingLowerNav = true

        lowerNav.updatePage(currentSectons, currentDomainLevel)
        await lowerNav.enable(init, func)
        if (currentSection !== undefined) lowerNav.updateSelectedLink(currentSection)

      }
      
    })

    let navs = new ElementList<Element>(header, lowerNav)
    

    let lastScrollProg = 0

    let currentDomainLevel = 0
    let currentSectons: {[link: string]: HighlightAbleIcon}[]
    let currentSection: string


    let pageManager = new PageManager((page, sections, domainLevel) => {
      currentDomainLevel = domainLevel
      currentSectons = sections

      const sectionNames = Object.keys(sections)


      let lastData: any
      let removeIndices = []
      sectionNames.ea((s, i) => {
        let data = lang.links[s]

        while (data === undefined) {
          if (s === "") {
            data = lastData
            break
          }
          s = s.slice(0, s.lastIndexOf(dirString))
          data = lang.links[s]
        }
  
        if (data === lastData) removeIndices.add(i)
        else lastData = data
      })
      for (const i of removeIndices) {
        delete sections[sectionNames[i]]
      }
      sectionNames.rmI(...removeIndices)


      if (currentlyShowingLowerNav) lowerNav.updatePage(sections, domainLevel)
      header.updatePage(sectionNames, domainLevel)
      
      
      header.setPreferedLeftSideBorderSpacing(page.preferedLeftBoundry)
    }, (section) => {
      currentSection = section
      if (currentlyShowingLowerNav) lowerNav.updateSelectedLink(section)
      header.updateSelectedLink(section)
    }, (prog) => {
      if (lastScrollProg > topLimit) {
        if (prog <= topLimit) {
          header.onTop()
        }
        if (prog <= topLimitForBlockingInteractions) {
          header.unblockInteractions()
        }
      }
      else {
        if (prog > topLimit) {
          header.notTop()
        }
        if (prog > topLimitForBlockingInteractions) {
          header.blockInteractions()
        }
      }

      lastScrollProg = prog
    });

    

    this.apd(pageManager)
    pageManager.activate()
    pageManager.minimalContentPaint().then(() => {
      const themeSub = new DataSubscription(new Data(undefined), (theme) => {
        header.theme.set(theme)
        lowerNav.theme.set(theme)
      }, true, false)

      const accentThemeSub = new DataSubscription(new Data(undefined as "primary" | "secondary"), (theme) => {
        lowerNav.accentTheme.set(theme)
      }, true, false)
      pageManager.addAccentThemeIntersectionListener(lowerNav, accentThemeSub.data.bind(accentThemeSub))    
      pageManager.addThemeIntersectionListener(header, themeSub.data.bind(themeSub))    
      pageManager.addThemeIntersectionListener(lowerNav, themeSub.data.bind(themeSub))
      
      pageManager.fullContentPaint().then(() => {
        pageManager.completePaint().then(() => {

        })
      })

    })
    
    
    





    this.apd(header, lowerNav)
    
    
    


    

  }

  stl() {
    return super.stl() + require("./site.css").toString()
  }
  pug() {
    return require("./site.pug").default
  }
}

declareComponent("site", Site)
