import delay from "delay";
import FormUi from "./formUi";
import { EventListener } from "extended-dom"

// distance between two points
function distance(p1: [number, number], p2: [number, number]) {
  return Math.sqrt(Math.abs(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2)));
}

export default function (t: FormUi) {


  
  t.initRipple = function(e?: MouseEvent | TouchEvent | KeyboardEvent | "center"): () => void {
    if (!t.enabled.get()) return
    let rippleSettled: Function
    const myRippleSettledProm = t.rippleSettled = new Promise((res) => {rippleSettled = res})
    t.removeClass("rippleSettled")
    const fadeRippleCb = t.initRippleCb()

    let rippleWaveElemContainer = t.waveElement.cloneNode(true) as Element;
    let rippleWaveElem = rippleWaveElemContainer.children[0]
    t.rippleElements.apd(rippleWaveElemContainer); 

    const fadeAnimIfPossible: Function & {auto?: boolean} = () => {
      setTimeout(() => {
        if (!fadeAnim.auto) return
        t.rippleElems.rmV(rippleWaveElem)
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

    (rippleWaveElem as any).fade = fadeAnim;
    t.rippleElems.add(rippleWaveElem);

    t.fadeRipple.add(fadeAnim);

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
      width: t.width(),
      height: t.height()
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
        t.on("blur", uiOut, {once: true});
      }
      else {
        document.body.on("mouseup", uiOut, {once: true});

      }
      let offset = t.absoluteOffset();
      x = (e as MouseEvent).pageX - offset.left;
      y = (e as MouseEvent).pageY - offset.top;

      
    }
    else {
      x = body.width / 2;
      y = body.height / 2;

      if (e instanceof KeyboardEvent) {
        t.on("keyup", uiOut, {once: true});
        t.on("blur", uiOut, {once: true});
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
      if (t.rippleSettled === myRippleSettledProm) t.addClass("rippleSettled")
      rippleSettled()
    })


    
    

    return fadeisok
  }





  


  const preLs = (() => {

    const preLs = [] as EventListener[]
    preLs.add(t.on("mousedown", (e) => {
      if (!touched) {
        if (t.validMouseButtons.has(e.button)) {
          t.initRipple(e);
        }
      }
    }, {capture: true}))

    let touched = false
    preLs.add(t.on("touchend", () => {
      touched = true
      delay(100).then(() => {
        touched = false
      })
    }, {capture: true}))

    preLs.add(t.on("touchstart", (e) => {
      t.initRipple(e);
    }, {capture: true}))



    return preLs
  })();



  const curLs = (() => {

    const curLs = [] as EventListener[]
    const e = t.on("mousedown", (e) => {
      if (t.validMouseButtons.has(e.button)) t.initRipple(e);
    }, {capture: true})
    e.deactivate()
    curLs.add(e as any)

    return curLs
  })();


  (t as any).userFeedbackModeResult.ripple.get((mode) => {
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
  }, true)
}