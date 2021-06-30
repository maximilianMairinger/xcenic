import ThemeAble from "../themeAble";
import { EventListener } from "extended-dom";
import declareComponent from "../../../lib/declareComponent";
import * as domain from "./../../../lib/domain"
import { openInNewTab } from "../link/link";


const pressedClass = "pressed";


export default class Button extends ThemeAble<HTMLAnchorElement> {
  private doesFocusOnHover: boolean;
  private mouseOverListener: EventListener;
  private mouseOutListener: EventListener;
  private callbacks: ((e: MouseEvent | KeyboardEvent) => void)[] = [];

  private preferedTabIndex: number
  private _hotKey: string
  constructor(protected readonly enabled: boolean = false, focusOnHover: boolean = false, tabIndex: number = 0, public obtainDefault: boolean = false, public preventFocus = false, blurOnMouseOut: boolean = false, hotkey?: string) {
    super(ce("a") as any)
    

    if (enabled) this.enableForce(true)
    else this.enableForce(true)

    this.preferedTabIndex = tabIndex

    let alreadyPressed = false;

    this.componentBody.on("click", (e) => {
      /*if (e.which === 1)*/ this.click(e);
    });
    this.componentBody.on("mousedown", (e) => {
      if (e.which === 1) this.addClass(pressedClass)
    })
    this.componentBody.on("mouseup", () => {
      this.removeClass(pressedClass);
    });
    this.componentBody.on("mouseout", () => {
      this.removeClass(pressedClass);
    })
    console.log("comp", this.componentBody)
    this.componentBody.on("keydown", (e) => {
      if (e.key === " ") if (!alreadyPressed) {
        alreadyPressed = true;
        this.click(e)
      }
    });
    this.componentBody.on("keyup", (e) => {
      if (e.key === " " || e.key === "Enter"){
        alreadyPressed = false;
        this.removeClass(pressedClass);
        e.preventDefault()
      }
    });
    this.componentBody.on("blur", () => {
      alreadyPressed = false;
    });

    //@ts-ignore
    this.mouseOverListener = this.componentBody.on("mouseover", () => {
      this.focus();
    }, false)
    //@ts-ignore
    this.mouseOutListener = this.componentBody.on("mouseout", () => {
      this.blur();
    }, false)

    this.focusOnHover(focusOnHover);
    this.blurOnMouseOut(blurOnMouseOut);
    this.hotkey(hotkey)

    this.disable(true)
  }
  private enableForce(prevFocus: boolean) {
    //@ts-ignore
    this.enabled = true
    this.componentBody.tabIndex = this.preferedTabIndex
    this.addClass("enabled");
    if (!prevFocus) this.focus()
  }
  public enable(prevFocus: boolean = true) {
    if (this.enabled) return
    this.enableForce(prevFocus)
  }
  private disableForce(prevBlur: boolean) {
    //@ts-ignore
    this.enabled = false
    this.componentBody.tabIndex = -1
    this.removeClass("enabled");
    if (!prevBlur) this.blur()
  }
  public disable(prevBlur: boolean = false) {
    if (!this.enabled) return
    this.disableForce(prevBlur)
  }

  private _link: string
  private linkFn: any
  public link(): string
  public link(to: string, domainLevel?: number, push?: boolean, notify?: boolean): this
  public link(to?: string, domainLevel: number = 0, push = true, notify?: boolean) {
    if (to !== undefined) {
      if (to !== null) {
        this.obtainDefault = true
        let link = domain.linkMeta(to, domainLevel)
        this.componentBody.href = link.href
        this._link = link.link
        this.linkFn = this.addActivationCallback((e) => {
          if (e) e.preventDefault()

          if (link.isOnOrigin) domain.set(to, domainLevel, push, notify)
          else openInNewTab(to)
        })
        let updateF = () => {
          let link = domain.linkMeta(to, domainLevel)
          this.componentBody.href = link.href
        }
        this.componentBody.on("mouseover", updateF)
        this.componentBody.on("focus", updateF)
      }
      else {
        this.removeActivationCallback(this.linkFn)
      }

      return this
      
    }
    else return this._link
  }

  public blurOnMouseOut(to: boolean) {
    this.mouseOutListener.active(to)
  }
  public addActivationCallback<CB extends (e?: MouseEvent | KeyboardEvent) => void>(cb: CB): CB {
    this.callbacks.add(cb);
    if (!this.enabled) this.enable()
    return cb
  }
  public removeActivationCallback<CB extends (e?: MouseEvent | KeyboardEvent) => void>(cb: CB): CB {
    this.callbacks.removeV(cb);
    if (this.callbacks.empty && this.enabled) this.disable()
    return cb
  }

  public focusOnHover(): boolean
  public focusOnHover(to: boolean): void
  public focusOnHover(to?: boolean) {
    if (to !== undefined) {
      this.doesFocusOnHover = to;
      if (to) {
        this.mouseOverListener.activate();
        this.mouseOutListener.activate();
      }
      else {
        this.mouseOverListener.deactivate();
        this.mouseOutListener.deactivate();
      }
    }
    else return this.doesFocusOnHover;
  }

  
  public click<CB extends (e?: MouseEvent | KeyboardEvent) => void>(f: CB): CB
  public click(e?: MouseEvent | KeyboardEvent)
  public click(e_f?: MouseEvent | KeyboardEvent | ((e?: MouseEvent | KeyboardEvent) => void)) {
    if (e_f instanceof Function) {
      this.addActivationCallback(e_f)
    }
    else {
      if (e_f !== undefined && !this.obtainDefault) e_f.preventDefault();
      if (this.enabled) {
        if (!this.preventFocus) this.focus();
        this.callbacks.forEach(f => {f.call(this, e_f);});
      }
    }
    
  }
  private hotKeyListener: (e: KeyboardEvent) => void

  public hotkey(): string
  public hotkey(to: string): void
  public hotkey(to?: string) {
    if (to !== undefined) {
      if (to === null) {
        if (this._hotKey !== undefined) {
          document.off("keydown", this.hotKeyListener)
          delete this.hotKeyListener
        }
      }
      else if (this._hotKey === undefined) {
        this.hotKeyListener = (e) => {
          if (this.offsetParent !== null) if (e.key === this._hotKey) this.click()
        }
        document.on("keydown", this.hotKeyListener)
      }
      this._hotKey = to
    }
    else {
      return this._hotKey
    }
  }

  pug() {
    return require("./button.pug").default
  }
  stl() {
    return require("./button.css")
  }
}

declareComponent("button", Button)


