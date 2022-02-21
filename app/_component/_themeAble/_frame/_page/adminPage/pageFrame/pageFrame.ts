import { Data, DataBase, DataCollection } from "josm"
import { declareComponent } from "../../../../../../lib/declareComponent"
import Component from "../../../../../component"
import lang from "../../../../../../lib/lang"
import selectText from "select-text"


import tippy, {sticky} from "tippy.js"

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

export const minDistanceTop = 30 + 55


// TODO: reload while resolveing collision in animation...

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


    

    






      new DataCollection(pos.x, widthData).get((x, w) => {
        this.css({translateX: x * w})
      })




      pos.y.get((y) => {
        this.css({translateY: y})
      })




      const dragStartListener = headingElem.on("mousedown", (e) => {
        if (e.button === 0) {
          dragListener.activate()
          this.currentlyMoving.set(true)
        }
      })
  
      const dragListener = document.body.on("mousemove", (e) => {
        const zInv = 1 / zData.get()
        this.addUnscaledX(e.movementX * zInv)
        this.addUnscaledY(e.movementY * zInv)
      })
      dragListener.deactivate()
  
      const cancelDragF = () => {
        dragListener.deactivate()
        this.currentlyMoving.set(false)
      }
  
      document.body.on("mouseup", (e) => {
        if (e.button === 0) cancelDragF()
      })
      document.body.on("blur", cancelDragF)




      editing.get((editing) => {
        if (editing) {
          dragStartListener.deactivate()
          headingElem.css({cursor: "text", overflow: "visible"})
          headingElem.setAttribute("contenteditable", "true")
    
          selectText(headingElem)
        }
        else {
          dragStartListener.activate()
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
