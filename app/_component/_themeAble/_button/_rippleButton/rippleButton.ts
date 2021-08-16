import delay from "delay";
import declareComponent from "../../../../lib/declareComponent";
import Button from "../button";

export default abstract class RippleButton extends Button {
  private ripples: HTMLElement;
  private wave: HTMLElement;

  protected rippleStartIsOk = true
  protected rippleFadeIsOk = false

    constructor(activationCallback?: (e?: MouseEvent | KeyboardEvent) => void, enabled?: boolean, focusOnHover?: boolean, tabIndex?: number) {
      super(enabled, focusOnHover, tabIndex);
      this.draggable = false


      this.on("mousedown", (e) => {
        if (!touched) this.initRipple(e);
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
      })
      if (activationCallback) super.addActivationCallback(activationCallback);

      this.wave = ce("button-wave");

      this.ripples = ce("button-waves");
      this.apd(this.ripples);
    }

    protected fadeRipple: (() => void)[] = []

    public initRipple(e?: MouseEvent | TouchEvent | KeyboardEvent | "center"): () => void {
      if (!this.rippleStartIsOk) return

      let r = this.wave.cloneNode() as Element;
      this.ripples.append(r);

      let fadeAnim = async () => {
        if (!this.rippleFadeIsOk) return
        if (this.fadeRipple.includes(fadeAnim)) this.fadeRipple.rmV(fadeAnim)
        try {
          await r.anim({opacity: 0}, 500);  
        } catch (error) {
          
        }
        await delay(500)
        r.remove();
      }

      this.fadeRipple.add(fadeAnim)

      let fadeisok = () => {
        if (rdyToFade) fadeAnim();
        else rdyToFade = true;
      }

      let x: number;
      let y: number;


      if (e instanceof MouseEvent || e instanceof TouchEvent) {
        if (e instanceof TouchEvent) {
          //@ts-ignore
          e.pageX = e.touches[e.touches.length-1].pageX
          //@ts-ignore
          e.pageY = e.touches[e.touches.length-1].pageY


          document.body.on("touchcancel", fadeisok, {once: true});
          document.body.on("touchend", fadeisok, {once: true});
          this.on("blur", fadeisok, {once: true});
        }
        else {
          this.on("mouseup", fadeisok, {once: true});
          this.on("mouseout", fadeisok, {once: true});
        }
        let offset = this.absoluteOffset();
        x = (e as MouseEvent).pageX - offset.left - r.width() / 2;
        y = (e as MouseEvent).pageY - offset.top - r.height() / 2;

        
      }
      else {
        x = this.width() / 2 - r.width() / 2;
        y = this.height() / 2 - r.height() / 2;

        if (e instanceof KeyboardEvent) {
          this.on("keyup", fadeisok, {once: true});
          this.on("blur", fadeisok, {once: true});
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
