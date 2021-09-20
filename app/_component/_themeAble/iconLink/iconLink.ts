import declareComponent from "../../../lib/declareComponent"
import ThemeAble, { Theme } from "../themeAble";
import { Data } from "josm"
import Link from "../link/link"
import Icon from "../_icon/icon";


export default class IconLink extends ThemeAble {

  public linkElem: Link;
  private slotElem = this.q("slot")


  constructor(content: string | Data<string>, icon: Icon, link?: string, underline = true) {
    super(false)
    if (icon !== undefined) this.slotElem.apd(icon)
    
    this.componentBody.apd(this.linkElem = new Link(content, link, undefined, undefined, undefined, underline, this))
  }

  link(link: string) {
    this.linkElem.link(link)
  }
  content(to: string) {
    this.linkElem.content(to)
  }


  stl() {
    return require("./iconLink.css").toString()
  }
  pug() {
    return require("./iconLink.pug").default
  }
}

declareComponent("icon-link", IconLink)
