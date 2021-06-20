import Component from "../component"
import declareComponent from "../../lib/declareComponent"
import PageManager from "./../_themeAble/_frame/_manager/pageManager/pageManager"
import lang from "../../lib/lang"
import LowerNav from "../_themeAble/lowerNav/lowerNav"
import Header from "../_themeAble/header/header"
import { dirString } from "../../lib/domain"
import { ElementList } from "extended-dom"


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
    let currentSectons: string[]
    let currentSection: string

    let scrollTrendUpCounter = 0
    let scrollTrendDownCounter = 0

    let pageManager = new PageManager((page, sections, domainLevel) => {
      currentDomainLevel = domainLevel
      currentSectons = sections


      let lastData: any
      let removeIndices = []
      sections.ea((s, i) => {
        let data = lang.links[s]

        while (data === undefined) {
          if (s === "") {
            data = lastData
            break
          }
          sections[i] = s = s.slice(0, s.lastIndexOf(dirString))
          data = lang.links[s]
        }
  
        if (data === lastData) removeIndices.add(i)
        else lastData = data
      })
      sections.rmI(...removeIndices)


      if (currentlyShowingLowerNav) lowerNav.updatePage(sections, domainLevel)
      header.updatePage(sections, domainLevel)
    }, (section) => {
      currentSection = section
      if (currentlyShowingLowerNav) lowerNav.updateSelectedLink(section)
      header.updateSelectedLink(section)
    }, (scrollBarWidth) => {
      navs.css({width: `calc(100% - ${scrollBarWidth}px)`})
    }, (prog, userInited) => {
      if (lastScrollProg > topLimit) {
        if (prog <= topLimit) {
          header.onTop()
        }
      }
      else if (prog > topLimit) {
        header.notTop()
      }


      if (userInited) {
        if (currentlyShowingLowerNav) {
          if (prog > lastScrollProg) {
          
            scrollTrendUpCounter = 0
            scrollTrendDownCounter++
            if (scrollTrendDownCounter >= scrollTrendActivationCount) {
              lowerNav.minimize()
            }
          }
          else {
            scrollTrendDownCounter = 0
            scrollTrendUpCounter++
            if (scrollTrendUpCounter >= scrollTrendActivationCount) {
              lowerNav.maximize()
            }
          }
        }
      }

      lastScrollProg = prog
    });

    

    this.apd(pageManager)
    pageManager.activate()
    pageManager.minimalContentPaint().then(() => {
      pageManager.addThemeIntersectionListener(header, (themeUnderneath) => {
        header.theme(themeUnderneath)
      })    
      pageManager.addThemeIntersectionListener(lowerNav, (themeUnderneath) => {
        lowerNav.theme(themeUnderneath)
      })
      pageManager.fullContentPaint().then(() => {
        pageManager.completePaint().then(() => {

        })
      })

    })
    
    
    





    this.apd(header, lowerNav)
    
    
    


    

  }

  stl() {
    return require("./site.css").toString()
  }
  pug() {
    return require("./site.pug").default
  }
}

declareComponent("site", Site)
