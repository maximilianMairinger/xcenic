import { Data } from "josm"
import { declareComponent } from "../../../../../../lib/declareComponent"
import Component from "../../../../../component"
import lang from "../../../../../../lib/lang"


import tippy, {sticky} from "tippy.js"


let nth = 1

export class UrlDuplicateError extends Error {}


export default class PageFrame extends Component {

  public readonly heading = this.body.masterHeader as HTMLElement

  constructor(page?: HTMLElement, private nameData?: Data<string>) {
    super(false as any)
    this.append(page)
    if (this.nameData === undefined) this.nameData = new Data("Page " + nth++)

    this.sra(ce("style").html(require("tippy.js/dist/tippy.css").toString() + require('tippy.js/animations/shift-away-subtle.css').toString()))


    const tip = tippy(this.body.heading as HTMLElement, {
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


    this.body.heading.setAttribute("contenteditable", "true")
    
    
    const submitTextEdit = () => {
      console.log("submit")
      setHeadingSub.deactivate()
      try {
        this.nameData.set(this.body.heading.text())
      }
      catch (e) {
        if (e instanceof UrlDuplicateError) {
          tip.show()

        }
        else throw e
      }
      setHeadingSub.activate(false)
    }

    this.body.heading.on("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        this.blur()
      }
    })

    this.body.heading.on("blur", () => {
      submitTextEdit()
    })

    const setHeadingSub = this.nameData.get((name) => {
      this.body.heading.text(name)
    })



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
