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


export class UrlDuplicateError extends Error {}


export default class PageFrame extends Component {

  public readonly heading = this.body.masterHeader as HTMLElement
  public currentlyMoving: Data<boolean> = new Data(false) as Data<boolean>

  constructor(page: HTMLElement, private nameData: Data<string>, public pos: DataBase<{x: number, y: number}>, zData: Data<number>, widthData: Data<number>, addNoScaleBoundAddon: (addon: HTMLElement, pos: {x: number, y: number}) => {remove(): void}) {
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
      this.css({translateX: x})
    })

    let intentionalY = pos.y.get()


    zData.get((z) => {
      const y = intentionalY
      const max = minDistanceTop / z + minDistanceTop
      if (y < max) {
        ySub.setToData(max)
        this.css({translateY: max})
      }
      else this.css({translateY: y})
    })
    const ySub = pos.y.get((y) => {
      const z = zData.get()
      const max = minDistanceTop / z + minDistanceTop
      if (y < max) {
        ySub.setToData(max)
        this.css({translateY: max})
        intentionalY = max
      }
      else {
        this.css({translateY: y})
        intentionalY = y
      }
      
    })





    const dragStartListener = headingElem.on("mousedown", (e) => {
      if (e.button === 0) {
        if (pos.y.get() < minDistanceTop / zData.get() + minDistanceTop) pos.y.set(minDistanceTop / zData.get() + minDistanceTop)
        dragListener.activate()
        this.currentlyMoving.set(true)
      }
    })

    const dragListener = document.body.on("mousemove", (e) => {
      const zInv = 1 / zData.get()
      pos.x.set(pos.x.get() + (e.movementX * zInv))
      pos.y.set(pos.y.get() + (e.movementY * zInv) )
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
