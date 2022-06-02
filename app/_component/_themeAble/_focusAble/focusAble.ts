import { DataCollection } from "josm"
import { Data, DataBase } from "../../../lib/josm";
import { DataBase as DATABASE } from "josm";

import declareComponent from "../../../lib/declareComponent";
import { EventListener } from "extended-dom"
import ThemeAble, { Theme } from "../themeAble";


export default class FocusAble<T extends boolean | HTMLElement | HTMLAnchorElement = boolean | HTMLElement> extends ThemeAble<T> {

  public userFeedbackMode = new DataBase({}) as any as DATABASE<{
    focus: boolean | "direct"
  }>
  protected userFeedbackModeResult = new DataBase({}) as any as typeof this["userFeedbackMode"]
  protected userFeedbackModeCalc = new DataBase({}) as any as {[key in keyof typeof this["userFeedbackMode"]]: DataBase<{
    normal: typeof this["userFeedbackMode"][key], 
    conditions: boolean[], 
    mandatory: boolean[]
  }>}

  protected focusManElem = ce("focus-man")
  constructor(componentBodyExtension?: HTMLElement | boolean, theme?: Theme | null) {
    super(componentBodyExtension, theme)


    this.userFeedbackModeResult((settings, addedSettings, removedSettings) => {
      for (const key in addedSettings) {
        let ob = {} as any
        ob[key] = true
        this.userFeedbackMode(ob)
        this.userFeedbackMode[key].set(undefined)
        ob = {}
        ob[key] = {
          normal: addedSettings[key],
          conditions: [],
          mandatory: [],
        }
        // @ts-ignore
        this.userFeedbackModeCalc(ob)
        const conditionsObservableList = this.userFeedbackModeCalc[key].conditions as DataBase<boolean[]>

        


        const canBeNormal = new Data(true) as Data<boolean>
        const canBeNormalAggregator = new DataCollection(new Data(true) as any) as DataCollection<boolean[]>


        canBeNormalAggregator.get((...bools) => {
          // console.log("key", key)

          // debugger
          // @ts-ignore
          canBeNormal.set(bools.reduce((a, b) => a && b, true) as boolean)
        }, false)

        // @ts-ignore
        conditionsObservableList((full: boolean[]) => {
          // console.log("key", key)
          // debugger
          const bools = [] as Data<boolean>[]
          for (let i = 0; i < full.length; i++) {
            bools.push(conditionsObservableList[i] as any as Data<boolean>)
          }

          setTimeout(() => {
            canBeNormalAggregator.set(...bools as any)
          })
        }, false, true)



        const canConsiderObservableList = this.userFeedbackModeCalc[key].mandatory as DataBase<boolean[]>

        const canConsider = new Data(true) as Data<boolean>
        const canConsiderAggregator = new DataCollection(new Data(true) as any) as DataCollection<boolean[]>

        canConsiderAggregator.get((...bools) => {
          // @ts-ignore
          canConsider.set(bools.reduce((a, b) => a && b, true) as boolean)
        }, false)

        
        // @ts-ignore
        canConsiderObservableList((full: boolean[]) => {
          const bools = [] as Data<boolean>[]
          for (let i = 0; i < full.length; i++) {
            bools.push(canConsiderObservableList[i] as any as Data<boolean>)
          }

          
          canConsiderAggregator.set(...bools as any)
        }, false, true)




        // debugger
        new DataCollection(canBeNormal as any, this.userFeedbackModeCalc[key].normal, this.userFeedbackMode[key], canConsider as any).get((canBeNormal, normal, user, canConsider) => {
          // console.log("key", key)
          this.userFeedbackModeResult[key].set(canConsider ? user !== undefined ? user : canBeNormal ? normal : false : false)
        }, false)
        

      }
      
    }, false, false)

    this.userFeedbackModeResult({focus: "direct"})


    super.apd(this.focusManElem)


    const clickFocusListener: EventListener[] = []
    let lastBlurListener: EventListener
    let lastMouseoutListener: EventListener
    clickFocusListener.add(
      this.on("mousedown", () => {
        this.addClass("clickFocus")
        if (lastBlurListener) {
          lastBlurListener.deactivate()
          lastBlurListener = undefined
        }
        setTimeout(() => {
          lastBlurListener = this.on("blur", () => {
            this.removeClass("clickFocus")
            lastBlurListener = undefined
          }, {once: true})
        })
        
      }, true),
      this.on("mouseup", () => {
        this.addClass("afterClickFocus")
        if (lastMouseoutListener) {
          lastMouseoutListener.deactivate()
          lastMouseoutListener = undefined
        }
        setTimeout(() => {
          lastMouseoutListener = this.on("mouseout", () => {
            this.removeClass("afterClickFocus")
            lastMouseoutListener = undefined
          }, {once: true})
        })
        

      }, true)
    )


    setTimeout(() => {
      this.userFeedbackModeResult.focus.get((enable) => {
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
    }, 2000)
    
    
  }

  public pug(): string {
    return require("./focusAble.pug").default
  }
  stl() {
    return super.stl() + require("./focusAble.css").toString()
  }
  
}
