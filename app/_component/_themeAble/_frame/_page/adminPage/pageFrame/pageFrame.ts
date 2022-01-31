import { Data, DataBase, DataCollection } from "josm"
import { declareComponent } from "../../../../../../lib/declareComponent"
import Component from "../../../../../component"
import lang from "../../../../../../lib/lang"
import selectText from "select-text"


import tippy, {sticky} from "tippy.js"


let nth = 1

export class UrlDuplicateError extends Error {}


export default class PageFrame extends Component {

  public readonly heading = this.body.masterHeader as HTMLElement


  constructor(page: HTMLElement, private nameData: Data<string>, initPos: {x: number, y: number}, abs: {z: number}, widthData: Data<number>) {
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
      maxWidth: "none",
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

    headingElem.on("dblclick", () => {
      dragStartListener.deactivate()
      headingElem.css({cursor: "text"})
      headingElem.setAttribute("contenteditable", "true")
      selectText(headingElem)
    })


    
    
    const submitTextEdit = () => {
      dragStartListener.activate()
      headingElem.css({cursor: "pointer"})
      headingElem.setAttribute("contenteditable", "false")


      const beforeSet = this.nameData.get()
      try {
        setHeadingSub.setToData(headingElem.text())
      }
      catch(e) {
        if (e instanceof UrlDuplicateError) {
          tip.show()
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


    


    const pos = this.pos = new DataBase(initPos)

    new DataCollection(pos.x, widthData).get((x, w) => {
      console.log(x, w)
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
      const zInv = 1 / abs.z

      pos.x.set(pos.x.get() + (e.movementX * zInv / widthData.get()))
      pos.y.set(pos.y.get() + (e.movementY * zInv))
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


  public pos: DataBase<{x: number, y: number}>
  public currentlyMoving: Data<boolean> = new Data(false) as Data<boolean>
    



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
