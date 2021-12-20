import { Data, DataBase } from "josm";
import declareComponent from "../../../lib/declareComponent";
import { EventListener } from "extended-dom"
import ThemeAble, { Theme } from "../themeAble";


export default class FocusAble<T extends false | HTMLElement | HTMLAnchorElement = false | HTMLElement> extends ThemeAble<T> {

  public userFeedbackMode = new DataBase({
    focus: "direct",
  }) as DataBase<{
    focus: boolean | "direct",
  }>
  protected focusManElem = ce("focus-man")
  constructor(componentBodyExtension?: HTMLElement | false, theme?: Theme | null) {
    super(componentBodyExtension, theme)

    super.apd(this.focusManElem)


    const clickFocusListener: EventListener[] = []
    clickFocusListener.add(
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
    )


    this.userFeedbackMode.focus.get((enable) => {
      if (!enable) {
        this.removeClass("clickFocus")
        this.removeClass("afterClickFocus")
        this.focusManElem.remove()
      }
      else {
        super.apd(this.focusManElem)
        if (enable === "direct") {
          clickFocusListener.Inner("activate", [])
        }
        else {
          clickFocusListener.Inner("deactivate", [])
          this.removeClass("afterClickFocus")
          this.removeClass("clickFocus")
        }
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
