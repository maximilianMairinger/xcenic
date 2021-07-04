import ThemeAble, { Theme } from "../themeAble"
import declareComponent from "../../../lib/declareComponent"
import { ElementList } from "extended-dom"
import LowerNavLink from "./../lowerNavLink/lowerNavLink"
import HighlightAbleIcon from "../_icon/_highlightAbleIcon/highlightAbleIcon"


export default declareComponent("lower-nav", class LowerNav extends ThemeAble {
  private currentLinkWrapperElems: ElementList
  private currentLinkElems: ElementList<LowerNavLink>
  private backgroundContainer = this.q("background-container")
  private linkContainer = this.q("link-container")
  private layers = this.backgroundContainer.childs(1, true).add(this.linkContainer) as any
  private slidy: Element

  constructor(public linkPressedCb?: Function) { 
    super()

  }
  

  private enableToken: Symbol
  public async enable(init: boolean, func: "css" | "anim" = init ? "css" : "anim") {
    this.enableToken = Symbol()
    this.componentBody.show()
    this.linkContainer.css({display: "flex"})
    await this.layers[func]({opacity: 1})
  }
  public async disable(init: boolean, func: "css" | "anim" = init ? "css" : "anim") {
    let token = this.enableToken = Symbol()
    let r = this.layers[func]({opacity: 0})
    if (!init) await r.then(() => {if (token === this.enableToken) this.componentBody.hide()})
  }


  public elems: {[link: string]: HighlightAbleIcon}[]
  public async updatePage(elems: {[link: string]: HighlightAbleIcon}[], domainLevel?: number) {
    if (elems.empty) return this.hide()
    this.show()
    
    this.elems = elems
    this.currentLinkWrapperElems = new ElementList()
    this.currentLinkElems = new ElementList()
    for (const link in elems) {
      let linkElem = new LowerNavLink(link, elems[link] as any as HighlightAbleIcon, domainLevel)
      linkElem.addActivationCallback(() => {
        if (this.linkPressedCb) this.linkPressedCb()
        this.maximize()
      })
      linkElem.passiveTheme()
      this.currentLinkElems.add(linkElem)
      this.currentLinkWrapperElems.add(ce("link-container").apd(linkElem))
    }

    this.currentLinkWrapperElems.first.prepend(this.slidy = ce("active-slidy"))
    if (!this.initialUpdate) {
      this.slidy.css({display: "block", opacity: 1})
    }

    this.linkContainer.html(this.currentLinkWrapperElems)

    if (this.callMeMaybe) {
      this.updateSelectedLink(this.callMeMaybe)
      delete this.callMeMaybe
    }
  }

  private lastHighlightElem: LowerNavLink
  private initialUpdate = true
  private callMeMaybe: string
  public async updateSelectedLink(activeLink: string) {
    if (!this.elems) {
      this.callMeMaybe = activeLink
      return
    }
    let index = Object.keys(this.elems).indexOf(activeLink)
    if (index === -1) index = 0

    if (this.lastHighlightElem) this.lastHighlightElem.downlight()
    this.lastHighlightElem = this.currentLinkElems[index]
    if (this.lastHighlightElem === undefined) return
    this.lastHighlightElem.highlight()


    // if (index === -1) return
    // let x = 100 * index
    

    // if (this.initialUpdate) {
    //   this.slidy.css({translateX: x + "%", display: "block"})
    //   this.slidy.anim({opacity: 1})
    //   this.initialUpdate = false
    // }
    // else this.slidy.anim({translateX: x + "%"}, 600)
    

    
  }

  private minimized = false
  public minimize() {
    if (!this.minimized) {
      this.minimized = true
      this.layers.anim({translateY: 22})
    }
  }

  
  public maximize() {
    if (this.minimized) {
      this.minimized = false
      this.layers.anim({translateY: .1})
    }
  }

  stl() {
    return require("./lowerNav.css").toString()
  }
  pug() {
    return require("./lowerNav.pug").default
  }
})
