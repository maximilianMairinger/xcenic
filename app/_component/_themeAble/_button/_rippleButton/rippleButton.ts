import delay from "delay";
import { ElementList } from "extended-dom";
import { Data } from "josm";
import declareComponent from "../../../../lib/declareComponent";
import Button from "../button";

export default abstract class RippleButton extends Button {
  private ripples: HTMLElement;
  private wave: HTMLElement;



  public preActive: Data<boolean> = new Data(false) as any

    constructor(activationCallback?: (e?: MouseEvent | KeyboardEvent) => void, enabled?: boolean, focusOnHover?: boolean, tabIndex?: number) {
      super(enabled, focusOnHover, tabIndex);
      this.draggable = false


      this.on("mousedown", (e) => {
        if (!touched) {
          this.initRipple(e);
          this.preActive.set(true)
        }
      })
      let touched = false
      this.on("touchend", () => {
        touched = true
        delay(100).then(() => {
          touched = false
        })
      })

      this.on("touchstart", (e) => {
        this.initRipple(e);
        this.preActive.set(true)
      })
      
      

      if (activationCallback) super.addActivationCallback(activationCallback);

      this.wave = ce("button-wave");

      this.ripples = ce("button-waves");
      this.apd(this.ripples);
    }


    protected fadeRipple: ((anim?: boolean) => void)[] = []
    protected rippleElems: ElementList<Element & {fade?: ((animation?: boolean) => void) & {auto?: boolean}}> = new ElementList

    public initRipple(e?: MouseEvent | TouchEvent | KeyboardEvent | "center"): () => void {

      let r = this.wave.cloneNode() as Element;
      this.ripples.append(r);

      const fadeAnimIfPossible: Function & {auto?: boolean} = () => {
        setTimeout(() => {
          if (!fadeAnim.auto) return
          return fadeAnim()
        })
      }
      
      

      const fadeAnim = async (anim = true) => {
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
          this.preActive.set(false)
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
          this.on("mouseup", uiOut, {once: true});
          this.on("mouseout", uiOut, {once: true});
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
      r.anim([{transform: "scale(0)", offset: 0}, {transform: "scale(" + (this.width() / 25 * 2.2) + ")"}], {duration: 350, easing: "linear"}).then(fadeisok);
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
