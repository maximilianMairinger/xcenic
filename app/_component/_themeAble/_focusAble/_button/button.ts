import FocusAble from "../focusAble";
import declareComponent from "../../../../lib/declareComponent";
import * as domain from "../../../../lib/domain"
import { PrimElem, Token, VariableLibrary } from "extended-dom";
import Component from "../../../component";




export default class Button extends FocusAble<HTMLAnchorElement> {
  private callbacks: ((e: MouseEvent | KeyboardEvent) => void)[] = [];
  public preventOnClickFocus = false

  private preferedTabIndex: number = 0
  private _hotKey: string
  public validMouseButtons = new Set([0])
  private slotElem = ce("slot")
  constructor(protected readonly enabled: boolean = false) {
    super(ce("a") as any)
    super.apd(this.slotElem)

    this.draggable = false;

    
    

    if (enabled) this.enableForce()
    else this.disableForce()

    this.componentBody.on("click", (e) => {
      e.preventDefault()
    })

    this.componentBody.on("mouseup", (e) => {
      if (this.validMouseButtons.has(e.button)) this.click(e);
    });


    let alreadyPressed = false
    this.componentBody.on("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") if (!alreadyPressed) {
        alreadyPressed = true;
        this.click(e)
      }
    });
    this.componentBody.on("keyup", (e) => {
      if (e.key === " " || e.key === "Enter"){
        alreadyPressed = false;
        e.preventDefault()
      }
    });
    this.componentBody.on("blur", () => {
      alreadyPressed = false;
    });
  }
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

  public apd(...elems: PrimElem[]): this
  public apd(to: PrimElem | PrimElem[], library?: VariableLibrary, customTokens?: {open?: Token, close?: Token, escape?: Token}): this
  public apd(...a: any): this {
    Object.getPrototypeOf(Component).prototype.apd.call(this, ...a)
    return this
  }

  private _link: string
  private linkFn: any
  public link(): string
  public link(to: null): this
  public link(to: string, domainLevel?: number, push?: boolean, notify?: boolean): this
  public link(to?: string, domainLevel: number = 0, push = true, notify?: boolean) {
    if (to !== undefined) {
      if (to !== null) {
        this.validMouseButtons.add(1)
        this.validMouseButtons.add(2)


        let link = domain.linkMeta(to, domainLevel)
        this.componentBody.href = link.href
        this._link = link.link
        if (this.linkFn !== undefined) this.removeActivationCallback(this.linkFn)
        this.linkFn = this.click((e) => {
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
        this.validMouseButtons.delete(1)
        this.validMouseButtons.delete(2)

        if (this.linkFn !== undefined) this.removeActivationCallback(this.linkFn)
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

  
  public click<CB extends (e?: MouseEvent | KeyboardEvent) => void>(f: CB): CB
  public click(e?: MouseEvent | KeyboardEvent)
  public click(e_f?: MouseEvent | KeyboardEvent | ((e?: MouseEvent | KeyboardEvent) => void)) {
    if (e_f instanceof Function) {
      return this.addActivationCallback(e_f)
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
    return super.pug() + require("./button.pug").default
  }
  stl() {
    return super.stl() + require("./button.css")
  }
}

declareComponent("button", Button)

