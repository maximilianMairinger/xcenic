import { Prim } from "extended-dom";
import { Data } from "josm";
import declareComponent from "../../lib/declareComponent";
import Component from "../component";


const listOfAllTextElems = [] as Text[]
let currentlyEditableEnabled = true
export function enableEditableForAll() {
  for (const elem of listOfAllTextElems) elem.enableEditable()
}
export function disableEditableForAll() {
  for (const elem of listOfAllTextElems) elem.disableEditable()
}


export default class Text extends Component {

  private data: Data<Prim>

  constructor(data: Data<Prim>) {
    super(ce("slot"))


    listOfAllTextElems.push(this)

    if (currentlyEditableEnabled) this.enableEditable()
    else this.disableEditable()

    if (data) this.txt(data)


    this.on("input", () => {
      this.data.set(this.innerText)
    })
  }
  txt(): string
  txt(to: Prim, animOnExplicitChange?: boolean): this
  txt(to?: Data<Prim>, animOnExplicitChange?: boolean, animOnDataChange?: boolean): this
  txt(to?: Data<Prim> | Prim, animOnExplicitChange?: boolean, animOnDataChange?: boolean) {
    if (to !== undefined) {
      if (!(to instanceof Data)) console.warn("Text.txt(to) is no instance of Data, hence cannot be edited");
      else this.data = to
    }

    return super.txt(to as any, animOnExplicitChange, animOnDataChange) as any
  }

  enableEditable() {
    this.setAttribute("contenteditable", "true")  
  }
  disableEditable() {
    this.setAttribute("contenteditable", "false")
  }
  public pug(): string {
    return ""
  }
  stl() {
    return ""
  }
  
}

declareComponent("text", Text);
