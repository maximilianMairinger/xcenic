import Component from "../component"
import declareComponent from "../../lib/declareComponent"
import PageManager from "./../_themeAble/_frame/_manager/pageManager/pageManager"
import lang from "../../lib/lang"
import { dirString } from "../../lib/domain"

export default class Site extends Component {

  constructor() {
    super()


    
    

    let lastScrollProg = 0

    let currentDomainLevel = 0
    let currentSectons: string[]
    let currentSection: string

    let scrollTrendUpCounter = 0
    let scrollTrendDownCounter = 0

    let pageManager = new PageManager((page, sections, domainLevel) => {
      console.log("page changed to " + page + " with the sections ", sections)
    }, (section) => {
      console.log("section changed to " + section)
    }, () => {

    }, () => {
      
    });

    

    this.apd(pageManager)
    pageManager.activate()
    pageManager.minimalContentPaint().then(() => {
      

    })
    
    
    


    

  }

  stl() {
    return require("./site.css").toString()
  }
  pug() {
    return require("./site.pug").default
  }
}

declareComponent("site", Site)
