import delay from "delay";
import { ElementList, EventListener } from "extended-dom";
import { Data } from "josm";
import declareComponent from "../../../../../lib/declareComponent";
import Button from "../button";



if (window.TouchEvent === undefined) window.TouchEvent = class SurelyNotTouchEvent {} as any

export default abstract class RippleButton extends Button {
  private validButtons = [0]
  private ripples: HTMLElement;
  private wave: HTMLElement;



  public preActive: Data<boolean> = new Data(true) as any
  

  constructor(onClick?: (e?: MouseEvent | KeyboardEvent) => void) {
    super();
    this.draggable = false;

    this.addClass("rippleSettled")

    const preLs = (() => {

      const preLs = [] as EventListener[]
      preLs.add(this.on("mousedown", (e) => {
        if (!touched) {
          if (this.validButtons.includes(e.button)) this.initRipple(e);
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
        if (this.validButtons.includes(e.button)) this.initRipple(e);
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

    this.preActive.get((pre) => {
      if (pre) {
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
    }, false)

    


    if (onClick) super.click(onClick);

    this.wave = ce("button-wave-container").apd(ce("button-wave"))


    this.ripples = ce("button-waves");
    this.apd(this.ripples);
  }


  public link(): string
  public link(to: string, domainLevel?: number, push?: boolean, notify?: boolean): this
  public link(to?: string, domainLevel?: number, push?: boolean, notify?: boolean): any {
    if (typeof to === "string") this.validButtons.add(1, 2)
    else if (to === null) {
      if (this.validButtons.includes(1)) this.validButtons.rmV(1)
      if (this.validButtons.includes(2)) this.validButtons.rmV(2)
    }
    return super.link(to, domainLevel, push, notify)
  }

  protected fadeRipple: ((anim?: boolean) => void)[] = []
  protected rippleElems: ElementList<Element & {fade?: ((animation?: boolean) => Promise<void>) & {auto?: boolean}}> = new ElementList
  protected initRippleCb = (e?: MouseEvent | TouchEvent | KeyboardEvent | "center") => () => {}


  public rippleSettled = Promise.resolve()
  public initRipple(e?: MouseEvent | TouchEvent | KeyboardEvent | "center"): () => void {
    console.log("initRipple")
    let rippleSettled: Function
    const myRippleSettledProm = this.rippleSettled = new Promise((res) => {rippleSettled = res})
    this.removeClass("rippleSettled")
    const fadeRippleCb = this.initRippleCb()

    let rippleWaveElemContainer = this.wave.cloneNode(true) as Element;
    let rippleWaveElem = rippleWaveElemContainer.children[0]
    this.ripples.apd(rippleWaveElemContainer); 

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
      x = (e as MouseEvent).pageX - offset.left - rippleWaveElem.width() / 2;
      y = (e as MouseEvent).pageY - offset.top - rippleWaveElem.height() / 2;

      
    }
    else {
      x = this.width() / 2 - rippleWaveElem.width() / 2;
      y = this.height() / 2 - rippleWaveElem.height() / 2;

      if (e instanceof KeyboardEvent) {
        this.on("keyup", uiOut, {once: true});
        this.on("blur", uiOut, {once: true});
      }
    }
    rippleWaveElem.css({
        marginTop: y,
        marginLeft: x
    });
    let rdyToFade = false;
    let biggerMetric = this.width() > this.height() ? this.width() : this.height();

    
    
    const animProm = rippleWaveElem.anim([{transform: "scale(0)", offset: 0}, {transform: "scale(" + (this.width() / 25 * 2.2) + ")"}], {duration: biggerMetric * 4, easing: "linear"}).then(fadeisok);
    animProm.then(() => {
      if (this.rippleSettled === myRippleSettledProm) this.addClass("rippleSettled")
      rippleSettled()
    })
    
    

    return fadeisok
  }


  stl() {
    return super.stl() + require('./rippleButton.css').toString();
  }
  pug() {
    return super.pug() + require("./rippleButton.pug").default
  }
}

declareComponent("ripple-button", RippleButton)
