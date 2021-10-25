import delay from "delay";
import { ElementList, EventListener } from "extended-dom";
import { Data, DataBase } from "josm";
import declareComponent from "../../../../lib/declareComponent";
import Button from "../_button/button";
import FocusAble from "../focusAble"
import { Theme } from "../../themeAble"

if (window.TouchEvent === undefined) window.TouchEvent = class SurelyNotTouchEvent {} as any


// distance between two points
function distance(p1: [number, number], p2: [number, number]) {
    return Math.sqrt(Math.abs(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2)));
}

export default class FormUi<T extends false | HTMLElement | HTMLAnchorElement = false | HTMLElement> extends FocusAble<T> {
  private rippleElements: HTMLElement;
  private waveElement: HTMLElement;
  public validMouseButtons = new Set([0])

  public userFeedbackMode: DataBase<{
    ripple: boolean | "late",
    hover: boolean,
    focus: boolean | "direct",
    active: boolean
  }>


  private coverElems = {
    hover: this.q("hover-cover"),
    click: this.q("click-cover"),
  }

  constructor(componentBodyExtension?: HTMLElement | false) {
    super(componentBodyExtension)

    this.userFeedbackMode({
      ripple: true,
      hover: true,
      active: false
    })

    this.addClass("rippleSettled")


    this.userFeedbackMode.hover.get((y) => {
      this.coverElems.hover[y ? "addClass" : "removeClass"]("active")
    })

    this.userFeedbackMode.active.get((y) => {
      this.coverElems.click[y ? "addClass" : "removeClass"]("active")
    })

    const preLs = (() => {

      const preLs = [] as EventListener[]
      preLs.add(this.on("mousedown", (e) => {
        if (!touched) {
          if (this.validMouseButtons.has(e.button)) this.initRipple(e);
        }
      }, {capture: true}))

      let touched = false
      preLs.add(this.on("touchend", () => {
        touched = true
        delay(100).then(() => {
          touched = false
        })
      }, {capture: true}))

      preLs.add(this.on("touchstart", (e) => {
        this.initRipple(e);
      }, {capture: true}))



      return preLs
    })();



    const curLs = (() => {

      const curLs = [] as EventListener[]
      curLs.add(this.on("mousedown", (e) => {
        if (this.validMouseButtons.has(e.button)) this.initRipple(e);
      }, {capture: true}))

      return curLs
    })();


    let keyPressed = false
    this.on("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        if (!keyPressed) {
          keyPressed = true
          this.initRipple(e)
        }
      }
    }, {capture: true})
    this.on("keyup", (e) => {
      if (e.key === " " || e.key === "Enter") keyPressed = false
    })

    this.userFeedbackMode.ripple.get((mode) => {
      if (mode) {
        if (mode !== "late") {
          for (let p of preLs) {
            p.activate()
          }
          for (let c of curLs) {
            c.deactivate()
          }
        }
        else {
          for (let c of curLs) {
            c.activate()
          }
          for (let p of preLs) {
            p.deactivate()
          }
        }
      }
      else {
        for (let c of curLs) {
          c.deactivate()
        }
        for (let p of preLs) {
          p.deactivate()
        }
      }
    }, false)

    


    this.waveElement = ce("button-wave-container").apd(ce("button-wave"))


    this.rippleElements = ce("button-waves");
    this.apd(this.rippleElements);
  }

  protected fadeRipple: ((anim?: boolean) => void)[] = []
  protected rippleElems: ElementList<Element & {fade?: ((animation?: boolean) => Promise<void>) & {auto?: boolean}}> = new ElementList
  protected initRippleCb = (e?: MouseEvent | TouchEvent | KeyboardEvent | "center") => () => {}


  public rippleSettled = Promise.resolve()
  public initRipple(e?: MouseEvent | TouchEvent | KeyboardEvent | "center"): () => void {

    let rippleSettled: Function
    const myRippleSettledProm = this.rippleSettled = new Promise((res) => {rippleSettled = res})
    this.removeClass("rippleSettled")
    const fadeRippleCb = this.initRippleCb()

    let rippleWaveElemContainer = this.waveElement.cloneNode(true) as Element;
    let rippleWaveElem = rippleWaveElemContainer.children[0]
    this.rippleElements.apd(rippleWaveElemContainer); 

    const fadeAnimIfPossible: Function & {auto?: boolean} = () => {
      setTimeout(() => {
        if (!fadeAnim.auto) return
        this.rippleElems.rmV(rippleWaveElem)
        return fadeAnim()
      })
    }
    
    

    const fadeAnim = async (anim = true) => {
      fadeRippleCb()

      if (anim) {
        try {
          await rippleWaveElem.anim({opacity: 0}, 500);  
        } catch (error) {
          
        }
        await delay(500)
      }
      
      rippleWaveElemContainer.remove()
    }
    fadeAnim.auto = true;

    (rippleWaveElem as any).fade = fadeAnim
    this.rippleElems.add(rippleWaveElem)

    this.fadeRipple.add(fadeAnim)

    let fadeisok = () => {
      if (rdyToFade) fadeAnimIfPossible();
      else rdyToFade = true;
    }

    let once = true
    const uiOut = (e) => {
      if (once) {
        once = false;
        fadeisok()
      }
    }

    let x: number;
    let y: number;



    const body = {
      width: this.width(),
      height: this.height()
    }

    const ripple = {
      diameter: 25,
      radius: 25 / 2,
    }

    if (e instanceof MouseEvent || e instanceof TouchEvent) {
      if (e instanceof TouchEvent) {
        //@ts-ignore
        e.pageX = e.touches[e.touches.length-1].pageX
        //@ts-ignore
        e.pageY = e.touches[e.touches.length-1].pageY


        document.body.on("touchcancel", uiOut, {once: true});
        document.body.on("touchend", uiOut, {once: true});
        this.on("blur", uiOut, {once: true});
      }
      else {
        document.body.on("mouseup", uiOut, {once: true});

      }
      let offset = this.absoluteOffset();
      console.log("mouseX", (e as MouseEvent).pageX,  offset.left, ripple.radius)
      x = (e as MouseEvent).pageX - offset.left;
      console.log("mouseY", (e as MouseEvent).pageY,  offset.top, ripple.radius)
      y = (e as MouseEvent).pageY - offset.top;

      
    }
    else {
      x = body.width / 2;
      y = body.height / 2;

      if (e instanceof KeyboardEvent) {
        this.on("keyup", uiOut, {once: true});
        this.on("blur", uiOut, {once: true});
      }
    }
    rippleWaveElem.css({
        marginTop: y - ripple.radius,
        marginLeft: x - ripple.radius
    });
    let rdyToFade = false;

    
    
    const cursorPoint = [x, y] as [number, number]
    let maxDistance = Math.max(
      distance(cursorPoint, [0, 0]), 
      distance(cursorPoint, [body.width, body.height]), 
      distance(cursorPoint, [body.width, 0]), 
      distance(cursorPoint, [0, body.height])
    )

    const scale = maxDistance / ripple.radius

  
    
    
    const animProm = rippleWaveElem.anim([{transform: "scale(0)", offset: 0}, {transform: "scale(" + scale + ")"}], {duration: maxDistance * 4, easing: "linear"}).then(fadeisok);

    animProm.then(() => {
      if (this.rippleSettled === myRippleSettledProm) this.addClass("rippleSettled")
      rippleSettled()
    })
    
    

    return fadeisok
  }


  public pug(): string {
    return super.pug() + require("./formUi.pug").default
  }
  stl() {
    return super.stl() + require("./formUi.css").toString()
  }
  
}
