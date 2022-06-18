import { loadRecord } from "./../../_frame/frame"
import delay from "delay";
import { ElementList, EventListener } from "extended-dom";
import { Data, DataBase } from "../../../../lib/josm"
import declareComponent from "../../../../lib/declareComponent";
import Button from "../_button/button";
import FocusAble from "../focusAble"
import { Theme } from "../../themeAble"
import { DataSubscription } from "josm";

if (window.TouchEvent === undefined) window.TouchEvent = class SurelyNotTouchEvent {} as any



function waitUnitilData<T extends unknown>(data: Data<T>, equals: T | T[] | ((val: T) => boolean)): Promise<T> {
  const compareFunc: (t: T) => boolean = equals instanceof Function ? equals : equals instanceof Array ? t => equals.includes(t) : t => t === equals

  return new Promise<T>((resolve) => {
    if (compareFunc(data.get())) resolve(data.get())
    else {
      const listener = data.get((val) => {
        if (compareFunc(val as any)) {
          listener.deactivate()
          resolve(val as T)
        }
      }, false);
    }
  })
}



type ReadonlyData<T> = Omit<Data<T>, "set">

// distance between two points
function distance(p1: [number, number], p2: [number, number]) {
    return Math.sqrt(Math.abs(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2)));
}

export default class FormUi<T extends boolean | HTMLElement | HTMLAnchorElement = boolean | HTMLElement> extends FocusAble<T> {
  public rippleElements: HTMLElement;
  public waveElement: HTMLElement;
  public validMouseButtons: Set<number>

  protected moveBody: HTMLElement;

  // @ts-ignore
  public userFeedbackMode: DataBase<{
    focus: boolean | "direct",
    ripple: boolean | "late",
    hover: boolean,
    active: boolean,
    enabled: boolean,
    preHover: boolean
  }>



  private coverElems: {
    hover: HTMLElement,
    click: HTMLElement
  }


  public isFocused: ReadonlyData<boolean>
  public enabled: Data<boolean>
  constructor(componentBodyExtension: HTMLElement | boolean = false) {
    if (componentBodyExtension === false) {
      componentBodyExtension = ce("placeholder-component-body")
      
    }
    super(componentBodyExtension)

    this.coverElems = {
      hover: this.q("hover-cover"),
      click: this.q("click-cover"),
    }
    this.moveBody = this.q("move-me")
    this.validMouseButtons = new Set([0])
    this.fadeRipple = []
    this.rippleElems = new ElementList
    this.initRippleCb = (e?: MouseEvent | TouchEvent | KeyboardEvent | "center") => () => {}
    this.rippleSettled = Promise.resolve()


    if (this.componentBody instanceof HTMLElement) this.componentBody.id = "componentBody"

    this.userFeedbackModeResult({
      ripple: false,
      hover: true,
      active: false,
      enabled: true,
      preHover: true
    })


    this.addClass("rippleSettled")
    this.moveBody.apd(this.focusManElem)

    this.enabled = new Data(true) as Data<boolean>

    

    const ufc = this.userFeedbackModeCalc


    ufc.focus.addCondition(this.enabled)
    ufc.ripple.addCondition(this.enabled)
    ufc.hover.addCondition(this.enabled)
    ufc.active.addCondition(this.enabled)
    ufc.preHover.addCondition(this.enabled)


    const supportsHover = window.matchMedia && window.matchMedia("(hover:hover)").matches
    ufc.hover.addMandatoryCondition(supportsHover)
    ufc.active.addMandatoryCondition(supportsHover)
    ufc.preHover.addMandatoryCondition(supportsHover)







    

    const enabledSub = this.enabled.get((enabled) => {
      if (enabled) this.removeClass("disabled")
      else this.addClass("disabled")
    }, false)


    this.userFeedbackModeResult.enabled.get((showEnabledFeedback) => {
      if (showEnabledFeedback) enabledSub.activate(true)
      else enabledSub.deactivate()
    })


    




    this.userFeedbackModeResult.hover.get((y) => {
      this.coverElems.hover[y ? "addClass" : "removeClass"]("active")
    })

    this.userFeedbackModeResult.active.get((y) => {
      this.coverElems.click[y ? "addClass" : "removeClass"]("active")
    })

    

    
    const isFocused = (this as any).isFocused = new Data(false)
    this.on("focusin", () => {(this as any).isFocused.set(true)})
    this.on("focusout", () => {(this as any).isFocused.set(false)})





    const hovPreDet = ce("prehover-detector")
    hovPreDet.on("mousedown", (e) => {
      if (isFocused.get()) {
        e.preventDefault()
        e.stopPropagation()
      }
    }, true)
    this.componentBody.prepend(hovPreDet);

    
    const root = this.q("root-bounds")
    setTimeout(() => {
      waitUnitilData(this.userFeedbackModeResult.preHover, val => !!val).then(() => {
        loadRecord.full.add(async () => {
          const f = (await import("./preHoverInteraction")).default
          const controller = f(root as any, hovPreDet, this.moveBody as any, this.componentBody as any, this.userFeedbackModeResult.preHover)
          if (!this.userFeedbackModeResult.preHover.get()) controller.disable()

          this.userFeedbackModeResult.preHover.get((enabled) => {
            if (enabled) controller.enable()
            else controller.disable()
          }, false)
        }) 
      })
    })
    

    
    this.waveElement = ce("button-wave-container").apd(ce("button-wave"))


    
    this.rippleElements = ce("button-waves");
    this.moveBody.apd(this.rippleElements);


    setTimeout(() => {
      waitUnitilData(this.userFeedbackModeResult.ripple, val => !!val).then(() => {
        loadRecord.full.add(async () => {
          const f = (await import("./rippleInteraction")).default
          f(this as any)
        })
      })
    })
    
    
  }


  public fadeRipple: ((anim?: boolean) => void)[]
  public rippleElems: ElementList<Element & {fade?: ((animation?: boolean) => Promise<void>) & {auto?: boolean}}> 
  public initRippleCb: (e?: MouseEvent | TouchEvent | KeyboardEvent | "center") => () => void


  public rippleSettled: Promise<void>
  public initRipple(e?: MouseEvent | TouchEvent | KeyboardEvent | "center"): () => void {
    console.warn("initRipple not inited yet")
    return () => {}
  }


  public pug(): string {
    return super.pug() + require("./formUi.pug").default
  }
  stl() {
    return super.stl() + require("./formUi.css").toString()
  }
  
}

declareComponent("form-ui", FormUi)
