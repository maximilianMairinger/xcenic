import ThemeAble from "../themeAble";
import { EventListener } from "extended-dom";
import declareComponent from "../../../lib/declareComponent";
import * as domain from "./../../../lib/domain"
import e from "express";


function getActiveElement(root: Document | ShadowRoot = document): Element {
  const activeEl = root.activeElement;

  if (!activeEl) {
    return null;
  }

  if (activeEl.shadowRoot) {
    return getActiveElement(activeEl.shadowRoot);
  } else {
    return activeEl;
  }
}

const pressedClass = "pressed";


export default class Button extends ThemeAble<HTMLAnchorElement> {
  private doesFocusOnHover: boolean;
  private mouseOverListener: EventListener;
  private mouseOutListener: EventListener;
  private callbacks: ((e: MouseEvent | KeyboardEvent) => void)[] = [];
  public preventOnClickFocus = false

  private preferedTabIndex: number = 0
  private _hotKey: string
  constructor(protected readonly enabled: boolean = false) {
    super(ce("a") as any)
    

    if (enabled) this.enableForce()
    else this.disableForce()


    let alreadyPressed = false;

    this.componentBody.on("click", (e) => {
      e.preventDefault()
    })

    this.componentBody.on("mouseup", (e) => {
      if (e.button === 0) this.click(e);
    });
    this.componentBody.on("mousedown", (e) => {
      if (e.button === 0) this.addClass(pressedClass)
    })
    this.componentBody.on("mouseup", () => {
      this.removeClass(pressedClass);
    });
    this.componentBody.on("mouseout", () => {
      this.removeClass(pressedClass);
    })
    this.componentBody.on("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") if (!alreadyPressed) {
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

    
    this.componentBody.on("mouseover", () => {
      (this as any).lastFocusedElement = getActiveElement()
    })

    //@ts-ignore
    this.mouseOverListener = this.componentBody.on("mouseover", () => {
      this.focus();
    }).deactivate()

    //@ts-ignore
    this.mouseOutListener = this.componentBody.on("mouseout", () => {
      this.blurToLastFoc()
    }).deactivate()

  }
  public readonly lastFocusedElement: Element
  private enableForce() {
    //@ts-ignore
    this.enabled = true
    if (this.tabIndex === -1) this.tabIndex = this.preferedTabIndex
    this.addClass("enabled");
  }
  public enable() {
    if (this.enabled) return
    this.enableForce()
  }
  private disableForce() {
    //@ts-ignore
    this.enabled = false
    this.preferedTabIndex = this.tabIndex
    this.tabIndex = -1
    this.removeClass("enabled");
  }
  private blurToLastFoc() {
    let el = this as any
    while (el.lastFocusedElement) el = el.lastFocusedElement
    if (el !== this) el.focus()
    else el.blur()
  }
  public disable() {
    if (!this.enabled) return
    this.disableForce()
  }
  set tabIndex(to: number) {
    this.componentBody.tabIndex = to
  }
  get tabIndex(): number {
    return this.componentBody.tabIndex
  }

  private _link: string
  private linkFn: any
  public link(): string
  public link(to: string, domainLevel?: number, push?: boolean, notify?: boolean): this
  public link(to?: string, domainLevel: number = 0, push = true, notify?: boolean) {
    if (to !== undefined) {
      if (to !== null) {
        let link = domain.linkMeta(to, domainLevel)
        this.componentBody.href = link.href
        this._link = link.link
        this.linkFn = this.addActivationCallback((e) => {
          if (e) e.preventDefault()

          domain.set(to, domainLevel, push, notify)
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

  public addActivationCallback<CB extends (e: MouseEvent | KeyboardEvent | undefined) => void>(cb: CB): CB {
    this.callbacks.add(cb);
    if (!this.enabled) this.enable()
    return cb
  }
  public removeActivationCallback<CB extends (e: MouseEvent | KeyboardEvent | undefined) => void>(cb: CB): CB {
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
      if (e_f !== undefined) e_f.preventDefault();
      if (this.enabled) {
        if (!this.preventOnClickFocus) this.focus();
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


