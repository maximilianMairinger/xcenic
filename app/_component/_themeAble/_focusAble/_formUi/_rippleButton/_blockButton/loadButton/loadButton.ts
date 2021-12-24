import BlockButton from "../blockButton";
import delay from "delay";
import declareComponent from "../../../../../../../lib/declareComponent";
import Easing from "waapi-easing";
import CheckIcon from "./../../../../../_icon/check/check"


export default class LoadButton extends BlockButton {

  constructor(content?: string, onClick?: ((e?: MouseEvent | KeyboardEvent) => any)) {
    super(content, onClick);


    const superClick = this.button.click.bind(this.button)
    //@ts-ignore
    this.button.click = (e?: any) => {
      const ret = superClick(e) as Promise<any[]> | Function
      if (e instanceof Function) return ret
      else {
        const cbs = new Promise<any[]>((res) => {
          (ret as Promise<any[]>).then(arr => res(arr.flat())).catch((errF) => res([errF]))
        })
        
        const intrested = cbs.then(arr => !arr.empty)
        const doneAnim = this.showLoadingAnimationFor(ret as Promise<any>, intrested);
        
        cbs.then((cbs) => {
          for (const f of cbs) {
            if (f instanceof Function) doneAnim.then(f)
          }  
        })
        
        return ret
      }
    }


    

    
  }

  private loadingCircle = ce("loading-circle").addClass("buttonAccent")
  private checkIcon = new CheckIcon().addClass("buttonAccent")

  private async startLoading() {
    this.moveBody.apd(this.loadingCircle)

    await Promise.all([
      this.loadingCircle.anim({
        opacity: 1,
        marginRight: 0
      }),
      this.textElem.anim({
        translateX: -8
      })
    ])
    
  }
  private async stopLoading() {
    console.log("stop loading")
    await Promise.all([
      this.loadingCircle.anim({
        opacity: 0,
        marginRight: -5
      }),
      this.textElem.anim({
        translateX: .1
      })
    ])

    this.loadingCircle.remove()
  }
  private async succLoading() {
    console.log("sucLoading")
    this.moveBody.apd(this.checkIcon)

    await Promise.all([
      this.loadingCircle.anim({
        opacity: 0,
        marginRight: 5
      }),
      delay(100).then(() => this.checkIcon.anim({
        opacity: 1,
        marginRight: 0
      }))
    ])
    await delay(700)
    await Promise.all([
      this.checkIcon.anim({
        opacity: 0,
        marginRight: -5
      }),
      this.textElem.anim({
        translateX: .1
      })
    ])



  }
  private async errorLoading() {
    console.log("error loading")
    await delay(1000)
  }


  private showLoadingAnimationFor(time: Promise<any[]>, intrested: Promise<boolean>) {
    return new Promise<void>((res) => {
      
      const doneFuncGen = (doneFuncName: "stopLoading" | "errorLoading" | "succLoading") => async () => {
        clearTimeout(t)
        if (readyToFadout) {
          readyToFadout = undefined
          this[doneFuncName]().then(res)
        }
        else res()
      }

      intrested.then((yes) => {
        if (yes) time.then(doneFuncGen("succLoading")).catch(doneFuncGen("errorLoading"))
        else time.then(doneFuncGen("stopLoading")).catch(doneFuncGen("errorLoading"))
      })
  
      let readyToFadout: Promise<void>
      const t = setTimeout(() => {
        readyToFadout = this.startLoading()
      }, 50)
    })
    
  }

  
  stl() {
    return super.stl() + require("./loadButton.css").toString();
  }
  pug() {
    return super.pug()
  }
}

declareComponent("load-button", LoadButton)