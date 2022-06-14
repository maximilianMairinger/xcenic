import declareComponent from "../../../../../lib/declareComponent";
import FormUi from "../formUi";
import Button from "../../_button/button"
import { EventListener, PrimElem, Token, VariableLibrary } from "extended-dom";
import delay from "tiny-delay";





//@ts-ignore
export default class UiButton extends FormUi<Button> {
  protected button: Button

  constructor() {
    const button = new Button()
    super(button)

    this.userFeedbackModeResult({
      ripple: true,
      hover: true,
      active: true,
      enabled: true,
      preHover: true
    })
    

    this.button = button;
    this.delayLinkForwardUntilCalledAgain = true
    button.userFeedbackMode.focus.set(false)

    this.validMouseButtons = button.validMouseButtons

    const rippleListenerLs = [] as EventListener[]

    let keyPressed = false
    rippleListenerLs.push(
      this.on("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault()
          if (!keyPressed) {
            keyPressed = true
            this.initRipple(e)
          }
        }
      }, {capture: true}),
      this.on("keyup", (e) => {
        if (e.key === " " || e.key === "Enter") keyPressed = false
      })
    )


    this.userFeedbackMode.ripple.get((enabled) => {
      if (enabled) for (const ev of rippleListenerLs) ev.activate()
      else for (const ev of rippleListenerLs) ev.deactivate()
    })

    this.enabled.get(this.button.enabled.set.bind(this.button.enabled))




    const superClick = this.button.click.bind(this.button)
    //@ts-ignore
    this.button.click = (e?: any) => {
      const ret = superClick(e) as Promise<any[]> | Function
      if (e instanceof Function) return ret
      else {
        const cbs = new Promise<any[]>((res) => {
          (ret as Promise<any[]>).then(arr => res((arr as any).flat())).catch((errF) => res([errF]))
        })
        const doneAnim = delay(this.getAnimTimer())
        cbs.then((cbs) => {
          for (const f of cbs) {
            if (f instanceof Function) doneAnim.then(f)
          }  
        })
      }
    }
    // @ts-ignore
    this.button.click.superClick = superClick
  }

  protected set delayLinkForwardUntilCalledAgain(to: boolean) {
    // @ts-ignore
    this.button.delayLinkForwardUntilCalledAgain = to
  }
  protected get delayLinkForwardUntilCalledAgain() {
    // @ts-ignore
    return this.button.delayLinkForwardUntilCalledAgain
  }


  getAnimTimer() {
    const feed = this.userFeedbackModeResult
    if (!feed.enabled.get()) return 0
    if (feed.ripple.get()) return 150
    return 0
  }


  
  public link: ((() => string) & ((to: null) => this) & ((to: string, domainLevel?: number, push?: boolean, notify?: boolean) => this))
  public addActivationCallback?<CB extends (e: MouseEvent | KeyboardEvent | undefined) => void>(cb: CB): CB
  public removeActivationCallback?<CB extends (e: MouseEvent | KeyboardEvent | undefined) => void>(cb: CB): CB
  public click?<CB extends (e?: MouseEvent | KeyboardEvent) => void>(f: CB): CB
  public click?(e?: MouseEvent | KeyboardEvent): Promise<any[]>
  public hotkey?(key: string): void
  


  set tabIndex(to: number) {
    this.componentBody.tabIndex = to
  }
  get tabIndex() {
    return this.componentBody.tabIndex
  }

  public pug(): string {
    return super.pug() + require("./rippleButton.pug").default
  }
  stl() {
    return super.stl() + require("./rippleButton.css").toString()
  }
  
}

for (const f of ["link", "addActivationCallback", "removeActivationCallback", "click", "hotkey"]) {
  UiButton.prototype[f] = function (...args: any[]) {
    return this.button[f](...args)
  }
}

declareComponent("ripple-button", UiButton)
