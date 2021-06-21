import RippleButton from "../rippleButton";
import delay from "delay"
import declareComponent from "../../../../../lib/declareComponent";



export default class BlockButton extends RippleButton {
  private textElem = ce("button-text")
  private spinner = ce("loading-spinner")
  private textContainer = ce("button-container")
  constructor(content: string = "", activationCallback?: ((e?: MouseEvent | KeyboardEvent) => void | Promise<void>)) {
    super();

    if (activationCallback) this.addActivationCallback(activationCallback)
    this.content(content);
    this.apd(
      this.spinner
    ).apd(
      this.textContainer.apd(
        this.textElem
      )
    )

  }



  private activationCallbackIndex = new Map<Function, Function>()
  public addActivationCallback<CB extends (e?: MouseEvent | KeyboardEvent) => (void | Promise<void>)>(activationCallback: CB, animationDoneCb?: Function): CB {
    
    let inner = async (e) => {
      let res = activationCallback.call(this, e)
      if (res instanceof Promise) {
        this.loading() 
        this.disable()
        await res
        this.doneLoading()
        if (animationDoneCb) await animationDoneCb.call(this, e)
      }
      else if (animationDoneCb) await animationDoneCb.call(this, e)

      this.enable()
    }
    

    
    super.addActivationCallback(inner)
    this.activationCallbackIndex.set(activationCallback, inner)
    
    return activationCallback
  }
  public removeActivationCallback<CB extends (e?: MouseEvent | KeyboardEvent) => (void | Promise<void>)>(activationCallback: CB) {
    let inner = this.activationCallbackIndex.get(activationCallback)
    if (inner !== undefined) {
      super.removeActivationCallback(inner as (e?: MouseEvent | KeyboardEvent) => void)
    }

    return activationCallback
  }
  private async loading() {
    let proms = []
    delay(100).then(() => {
      proms.add(this.spinner.anim([
        {opacity: 0, offset: 0},
        {opacity: 1}
      ], 400))
      this.spinner.anim([
        {rotateZ: 0, offset: 0},
        {rotateZ: 360}
      ], {duration: 1000, iterations: Infinity, easing: "linear"})
    }),
    proms.add(this.textContainer.anim({translateX: 6}, 400))

    await Promise.all(proms)
  }
  private async doneLoading() {
    await Promise.all([
      this.spinner.anim({opacity: 0}).then(() => this.spinner.anim({rotateZ: 0})),
      this.textContainer.anim({translateX: .1}, 400)
    ])
  }
  content(to: string) {
    this.textElem.text(to)
  }
  stl() {
    return super.stl() + require('./blockButton.css').toString();
  }
  pug() {
    return super.pug() + require("./blockButton.pug").default
  }
}

declareComponent("block-button", BlockButton)