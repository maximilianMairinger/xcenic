import ThemeAble, { Theme } from "../themeAble"
import declareComponent from "../../../lib/declareComponent"
import { ElementList } from "extended-dom"
import "./../../_themeAble/_button/button"
import Button from "./../../_themeAble/_button/button"
import HighlightAbleIcon from "../_icon/_highlightAbleIcon/highlightAbleIcon"
import lang from "./../../../lib/lang"
import { Data } from "josm"

const navigationIconIndex = {
  xcenic: () => import("./../_icon/xcenic/xcenic"),
  
}

const hightlightClassString = "highlight"


export default class LowerNavLink extends ThemeAble {
  private buttonElem = this.q("c-button") as Button
  private textElem = this.q("text-container")
  private iconContainer = this.q("icon-container")

  /**
   * @param link href; this will be used as pointer for the icon Index & language
   * @param domainLevel domainLevel the link referes to
   * @param content override language interpolation from link
   * @param icon override icon interpolation from link
   */
  //@ts-ignore
  constructor(link: keyof typeof navigationIconIndex, domainLevel?: number, content?: keyof typeof navigationIconIndex | Data<keyof typeof navigationIconIndex>, icon?: keyof typeof navigationIconIndex)
  constructor(link: string, domainLevel?: number, content?: string | Data<string>, icon?: keyof typeof navigationIconIndex)
  constructor(link: string, domainLevel?: number, content?: string | Data<string>, icon?: keyof typeof navigationIconIndex) {
    super()

    this.buttonElem.preventFocus = true

    this.content(content)
    this.icon(icon)
    this.link(link, domainLevel)
  }

  public addActivationCallback<CB extends (e?: MouseEvent | KeyboardEvent) => void>(cb: CB): CB {
    return this.buttonElem.addActivationCallback(cb)
  }

  public removeActivationCallback<CB extends (e?: MouseEvent | KeyboardEvent) => void>(cb: CB): CB {
    return this.buttonElem.removeActivationCallback(cb)
  }


  public link(): string
  public link(link: keyof typeof navigationIconIndex, domainLevel?: number): void
  public link(link: string, domainLevel?: number): void
  public link(link?: string, domainLevel?: number): any {
    if (!this.content()) {
      let language = lang.links[link]
      if (language !== undefined) this.content(language)
      else this.content(link)
    }

    if (!this.icon()) {
      this.icon(link)
    }

    this.href(link, domainLevel)
  }

  public href(): string
  public href(href: string, domainLevel?: number): void
  public href(href?: string, domainLevel?: number): any {
    return this.buttonElem.link(href, domainLevel, false, true)
  }

  public content(): string
  public content(content: string | Data<string>): void
  public content(content: string | Data<string>): void
  public content(content?: string | Data<string>): any {
    return this.textElem.text(content as any)
  }


  private currentIconName: string
  private activeIconElem: HighlightAbleIcon

  public icon(): string
  public icon(icon: string): Promise<void>
  public icon(icon?: string): any {
    if (icon !== undefined) {
      let ic = navigationIconIndex[icon]
      if (ic === undefined) {
        this.textElem.anim({top: "20%"})
        console.warn("Unable to find icon for: \"" + icon + "\".")
      }
      else {
        this.currentIconName = icon;

        (async () => {
          this.activeIconElem = new ((await navigationIconIndex[icon]()).default)
          if (!this.currentlyActiveTheme) this.activeIconElem.passiveTheme()
          this.iconContainer.html(this.activeIconElem)
        })()
      }

    }
    else return this.currentIconName
  }

  public highlight() {
    this.addClass(hightlightClassString)
    if (this.activeIconElem) this.activeIconElem.highlight()
  }

  public downlight() {
    this.removeClass(hightlightClassString)
    if (this.activeIconElem) this.activeIconElem.downlight()
  }

  public passiveTheme() {
    if (this.activeIconElem) this.activeIconElem.passiveTheme()
    return super.passiveTheme()
  }

  public activeTheme() {
    if (this.activeIconElem) this.activeIconElem.activeTheme()
    return super.activeTheme()
  }


  stl() {
    return require("./lowerNavLink.css").toString()
  }
  pug() {
    return require("./lowerNavLink.pug").default
  }
}


declareComponent("lower-nav-link", LowerNavLink)