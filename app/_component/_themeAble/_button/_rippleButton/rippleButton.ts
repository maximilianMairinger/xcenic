import delay from "delay";
import { ElementList, EventListener } from "extended-dom";
import { Data } from "josm";
import declareComponent from "../../../../lib/declareComponent";
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

    const preLs = (() => {

      const preLs = [] as EventListener[]
      preLs.add(this.on("mousedown", (e) => {
        if (!touched) {
          if (this.validButtons.includes(e.button)) this.initRipple(e);
        }
      }))

      let touched = false
      preLs.add(this.on("touchend", () => {
        touched = true
        delay(100).then(() => {
          touched = false
        })
      }))

      preLs.add(this.on("touchstart", (e) => {
        this.initRipple(e);
      }))



      return preLs
    })();



    const curLs = (() => {

      const curLs = [] as EventListener[]
      curLs.add(this.on("mousedown", (e) => {
        if (this.validButtons.includes(e.button)) this.initRipple(e);
      }))

      return curLs
    })();

    this.on("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") this.initRipple(e)
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

    this.wave = ce("button-wave");

    this.ripples = ce("button-waves");
    this.apd(this.ripples);
    this.apd(ce("cover-me").css({
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0
    }))
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
  protected rippleElems: ElementList<Element & {fade?: ((animation?: boolean) => void) & {auto?: boolean}}> = new ElementList
  protected initRippleCb = (e?: MouseEvent | TouchEvent | KeyboardEvent | "center") => () => {}

  public initRipple(e?: MouseEvent | TouchEvent | KeyboardEvent | "center"): () => void {
    const fadeRippleCb = this.initRippleCb()

    let r = this.wave.cloneNode() as Element;
    this.ripples.append(r);

    const fadeAnimIfPossible: Function & {auto?: boolean} = () => {
      setTimeout(() => {
        if (!fadeAnim.auto) return
        return fadeAnim()
      })
    }
    
    

    const fadeAnim = async (anim = true) => {
      fadeRippleCb()
      this.rippleElems.rmV(r)

      if (anim) {
        try {
          await r.anim({opacity: 0}, 500);  
        } catch (error) {
          
        }
        await delay(500)
      }
      
      r.remove()
    }
    fadeAnim.auto = true;

    (r as any).fade = fadeAnim
    this.rippleElems.add(r)

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
      x = (e as MouseEvent).pageX - offset.left - r.width() / 2;
      y = (e as MouseEvent).pageY - offset.top - r.height() / 2;

      
    }
    else {
      x = this.width() / 2 - r.width() / 2;
      y = this.height() / 2 - r.height() / 2;

      if (e instanceof KeyboardEvent) {
        this.on("keyup", uiOut, {once: true});
        this.on("blur", uiOut, {once: true});
      }
    }
    r.css({
        marginTop: y,
        marginLeft: x
    });
    let rdyToFade = false;
    let biggerMetric = this.width() > this.height() ? this.width() : this.height();

    
    
    this.rippleAnimProm = r.anim([{transform: "scale(0)", offset: 0}, {transform: "scale(" + (this.width() / 25 * 2.2) + ")"}], {duration: biggerMetric * 4, easing: "linear"}).then(fadeisok);
    
    

    return fadeisok
  }

  protected rippleAnimProm: Promise<any>


  


  stl() {
    return super.stl() + require('./rippleButton.css').toString();
  }
  pug() {
    return super.pug() + require("./rippleButton.pug").default
  }
}

declareComponent("ripple-button", RippleButton)
