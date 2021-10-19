import { Data } from "josm";
import declareComponent from "../../../lib/declareComponent";
import { EventListener } from "extended-dom"
import ThemeAble, { Theme } from "../themeAble";


export default class FocusAble<T extends false | HTMLElement | HTMLAnchorElement = false | HTMLElement> extends ThemeAble<T> {

  public focusIndication = new Data(true)
  private focusManElem = ce("focus-man")
  constructor(componentBodyExtension?: HTMLElement | false, theme?: Theme | null) {
    super(componentBodyExtension, theme)

    super.apd(this.focusManElem)


    this.on("mousedown", () => {
      this.addClass("clickFocus")
      this.on("blur", () => {
        this.removeClass("clickFocus")
      }, {once: true})
    }),
    this.on("mouseup", () => {
      this.addClass("afterClickFocus")
      this.on("mouseout", () => {
        this.removeClass("afterClickFocus")
      }, {once: true})

    })


    this.focusIndication.get((enable) => {
      if (!enable) {
        this.removeClass("clickFocus")
        this.removeClass("afterClickFocus")
        this.focusManElem.remove()
      }
      else {
        super.apd(this.focusManElem)
      }
    }, false)
    
  }
  diableFocusIndecation() {

  }
  public pug(): string {
    return require("./focusAble.pug").default
  }
  stl() {
    return super.stl() + require("./focusAble.css").toString()
  }
  
}
