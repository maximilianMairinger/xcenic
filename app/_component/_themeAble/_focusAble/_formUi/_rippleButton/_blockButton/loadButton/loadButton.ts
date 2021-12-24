import BlockButton from "../blockButton";
import delay from "delay";
import declareComponent from "../../../../../../../lib/declareComponent";
import { Data } from "josm";


export default class LoadButton extends BlockButton {
  constructor(content?: string, onClick?: ((e?: MouseEvent | KeyboardEvent) => any)) {
    super(content, onClick);


    const superClick = this.button.click.bind(this.button)
    //@ts-ignore
    this.button.click = (e?: any) => {
      debugger
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


  private async startLoading() {
    console.log("start loading")
    await delay(200)
  }
  private async doneLoading() {
    console.log("done loading")
    await delay(1000)
  }
  private async errorLoading() {
    console.log("error loading")
    await delay(1000)
  }


  private showLoadingAnimationFor(time: Promise<any>) {
    return new Promise<void>((res) => {
      const doneFuncGen = (doneFuncName: "doneLoading" | "errorLoading") => async () => {
        clearTimeout(t)
        await readyToFadout
        this[doneFuncName]().then(res)
      }
      time.then(doneFuncGen("doneLoading")).catch(doneFuncGen("errorLoading"))
  
      let readyToFadout: Promise<void>
      const t = setTimeout(() => {
        readyToFadout = this.startLoading()
      }, 200)
    })
    
  }



  
  stl() {
    return super.stl()
  }
  pug() {
    return super.pug()
  }
}

declareComponent("load-button", LoadButton)