import BlockButton from "../blockButton";
import delay from "delay";
import declareComponent from "../../../../../../../lib/declareComponent";
import Easing from "waapi-easing";


export default class LoadButton extends BlockButton {
  constructor(content?: string, onClick?: ((e?: MouseEvent | KeyboardEvent) => any)) {
    super(content, onClick);


    const superClick = this.button.click.bind(this.button)
    //@ts-ignore
    this.button.click = (e?: any) => {
      const ret = superClick(e) as Promise<any[]> | Function
      if (e instanceof Function) return ret
      else {
        const doneAnim = this.showLoadingAnimationFor(ret as Promise<any>);
        
        (ret as Promise<any[]>).then((ret) => {
          for (const f of ret.flat()) {
            if (f instanceof Function) doneAnim.then(f)
          }
        })
        
        return ret
      }
    }


    

    
  }

  private loadingCircle = ce("loading-circle").addClass("buttonAccent")


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
        translateX: .1,
      })
    ])

    this.loadingCircle.remove()
  }
  private async succLoading() {
    console.log("succ loading")
    await delay(1000)
  }
  private async errorLoading() {
    console.log("error loading")
    await delay(1000)
  }


  private showLoadingAnimationFor(time: Promise<any>) {
    return new Promise<void>((res) => {
      const doneFuncGen = (doneFuncName: "stopLoading" | "errorLoading") => async () => {
        clearTimeout(t)
        if (readyToFadout) {
          readyToFadout = undefined
          this[doneFuncName]().then(res)
        }
        else res()
      }
      time.then(doneFuncGen("stopLoading")).catch(doneFuncGen("errorLoading"))
  
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