import { Data, DataBase, DataCollection } from "josm"
import { declareComponent } from "../../../../../../lib/declareComponent"
import Component from "../../../../../component"
import lang from "../../../../../../lib/lang"
import selectText from "select-text"


import tippy, {sticky} from "tippy.js"
import { stopRenderOnUnloadCb } from "../adminPage"
import { EventListener } from "extended-dom"

function makePopperIndecator() {
  const indecator = ce("popper-indecator")
  // @ts-ignore
  indecator.css({
    width: 100,
    height: 100,
    borderRadius: "50%",
    backgroundColor: "red",
    transformOrigin: "left top",
    willChange: "transform"
  })
  return indecator
}


const dragPrevImg = document.createElement("img");
dragPrevImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'><rect width='0' height='0' fill='red' /></svg>";




export class UrlDuplicateError extends Error {}


export default class PageFrame extends Component {

  public readonly heading = this.body.masterHeader as HTMLElement
  public currentlyMoving: Data<boolean> = new Data(false) as Data<boolean>

  constructor(page: HTMLElement, private nameData: Data<string>, private pos: DataBase<{x: number, y: number}>, zData: Data<number>, private widthData: Data<number>, addNoScaleBoundAddon: (addon: HTMLElement, pos: {x: number, y: number}) => {remove(): void}) {
    super(false as any)
    this.append(page)

    this.sra(ce("style").html(require("tippy.js/dist/tippy.css").toString() + require('tippy.js/animations/shift-away-subtle.css').toString()))


    const headingElem = this.body.heading as HTMLElement


    const tip = tippy(headingElem, {
      content: lang.cannotChangeUrl.get(),
      trigger: "manual",
      placement: "top",
      animation: 'shift-away-subtle',
      appendTo: "parent",
      arrow: true,
      maxWidth: 400,
      sticky: true,
      plugins: [sticky],
      
      popperOptions: {
        modifiers: [
          {
            name: 'flip',
            options: {
              padding: {top: 60, left: 5, right: 5, bottom: 5},
            },
          }
        ]
      }
    })
    tip.popper.css({width: "max-content"})


    const editing = new Data(false)
    

    headingElem.on("dblclick", () => {
      editing.set(true)
    })


    // addNoScaleBoundAddon(makePopperIndecator(), {x: 10000, y: 100})
 
    
    const submitTextEdit = () => {
      editing.set(false)


      const beforeSet = this.nameData.get()
      try {
        setHeadingSub.setToData(headingElem.text())
      }
      catch(e) {
        if (e instanceof UrlDuplicateError) {
          tip.show()
          // addNoScaleBoundAddon(makePopperIndecator(), {x: 400, y: 400})
          headingElem.text(beforeSet, false)
          this.nameData.set(beforeSet)
        }
        else throw e
      }

    }

    headingElem.on("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        this.blur()
      }
    })

    headingElem.on("blur", () => {
      submitTextEdit()
    })

    const setHeadingSub = this.nameData.get((name) => {
      headingElem.text(name)
    })


    

    



    


      const xSub = new DataCollection(pos.x, widthData).get((x, w) => {
        this.css({translateX: x * w})
      })




      const ySub = pos.y.get((y) => {
        this.css({translateY: y})
      })

      stopRenderOnUnloadCb(() => {
        xSub.deactivate()
        ySub.deactivate()
      })






      headingElem.draggable = true



      headingElem.on("dragstart", (e) => {


        this.currentlyMoving.set(true)
        lastX = e.x
        lastY = e.y

        e.dataTransfer.setDragImage(dragPrevImg as any as HTMLElement, 0, 0);
        for (const ls of bodyListeners) ls.activate()
        e.dataTransfer.effectAllowed = "move";

      })

      


      const bodyListeners = [] as Array<EventListener>


      

      let lastX: number
      let lastY: number
      bodyListeners.push(document.body.on("dragover", (e) => {
        e.preventDefault()
        // e.dataTransfer.dropEffect = "move"


        const zInv = 1 / zData.get()
        this.addUnscaledX((e.x - lastX) * zInv)
        this.addUnscaledY((e.y - lastY) * zInv)
        lastX = e.x
        lastY = e.y
      }))


      bodyListeners.push(document.body.on("drop", (e) => {
        e.preventDefault()
        cancelDragF()
      }, true))



      headingElem.on("dragend", () => {
        cancelDragF()
      }, true)


  


      for (const ls of bodyListeners) ls.deactivate()




  
      const cancelDragF = () => {
        for (const ls of bodyListeners) ls.deactivate()
        this.currentlyMoving.set(false)
      }


      this.currentlyMoving.get((moving) => {
        if (moving) {
          document.body.css({cursor: "grabbing !important"})
          headingElem.css({cursor: "grabbing !important"})

        }
        else {
          document.body.css({cursor: "default"})
        }
      })




      editing.get((editing) => {
        if (editing) {
          headingElem.draggable = false
          headingElem.css({cursor: "text", overflow: "visible"})
          headingElem.setAttribute("contenteditable", "true")
    
          selectText(headingElem)
        }
        else {
          headingElem.draggable = true
          headingElem.css({cursor: "pointer", overflow: "hidden"})
          headingElem.setAttribute("contenteditable", "false")
        }
      }, false)

      





    
    
    


    





    
  }


    addUnscaledX(x: number) {
      this.pos.x.set(this.pos.x.get() + x / this.widthData.get())

    }
    addUnscaledY(y: number) {
      this.pos.y.set(this.pos.y.get() + y)
    }
    setScaledX(x: number) {
      this.pos.x.set(x)
    }
    setScaledY(y: number) {
      this.pos.y.set(y)
    }
    setScaledPos(pos: {x: number, y: number}) {
      this.pos(pos)
    }

    getScaledX() {
      return this.pos.x.get()
    }
    getScaledY() {
      return this.pos.y.get()
    }

    getScaledPos() {
      return {
        x: this.pos.x.get(),
        y: this.pos.y.get()
      }
    }



  name(to?: string) {
    if (to !== undefined) {
      this.nameData.set(to)
      return this.nameData
    }
    else return this.nameData.get()
  }



  stl() {
    return super.stl() + require("./pageFrame.css").toString()
  }
  pug() {
    return require("./pageFrame.pug").default
  }
}
declareComponent("page-frame", PageFrame)
