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


const topLimit = 0
const scrollTrendActivationCount = 20

export default class Site extends Component {

  constructor() {
    super()


    


    
    

    let lowerNav = new LowerNav(() => {
      scrollTrendDownCounter = scrollTrendUpCounter = 0
    })
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

    let scrollTrendUpCounter = 0
    let scrollTrendDownCounter = 0

    let pageManager = new PageManager((theme: string) => {
      lowerNav.setHighlightColor(theme)
    }, (page, sections, domainLevel) => {
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
    }, (section) => {
      currentSection = section
      if (currentlyShowingLowerNav) lowerNav.updateSelectedLink(section)
      header.updateSelectedLink(section)
    }, (prog) => {
      if (lastScrollProg > topLimit) {
        if (prog <= topLimit) {
          header.onTop()
        }
      }
      else if (prog > topLimit) {
        header.notTop()
      }

      lastScrollProg = prog
    },);

    

    this.apd(pageManager)
    pageManager.activate()
    pageManager.minimalContentPaint().then(() => {
      let themeSub = new DataSubscription(new Data(undefined), (theme) => {
        header.theme.set(theme)
        lowerNav.theme.set(theme)
      }, true, false)
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
