import { EventListener, Prim } from "extended-dom";
import { Data, DataSubscription } from "josm";
import declareComponent from "../../lib/declareComponent";
import Component from "../component";


export function textify(element: HTMLElement, visualUnit?: HTMLElement) {
  const txtELem = new Text(undefined, visualUnit)
  element.apd(txtELem)
  element.txt = element.text = txtELem.txt.bind(txtELem);
  (element as HTMLElement & {textElement: Text}).textElement = txtELem
  return element as HTMLElement & {textElement: Text}
}


const listOfAllTextElems = [] as Text[]
let currentlyEditableEnabled = true
export function enableEditableForAll() {
  for (const elem of listOfAllTextElems) elem.editMode.set(true)
}
export function disableEditableForAll() {
  for (const elem of listOfAllTextElems) elem.editMode.set(false)
}


export default class Text extends Component {

  public editMode = new Data(false)
  public visualUnit = new Data(undefined, this)

  constructor(data?: Data<Prim>, visualUnit?: HTMLElement) {
    super(ce("slot"))


    listOfAllTextElems.push(this)

    if (currentlyEditableEnabled) this.editMode.set(true)


    if (data) this.txt(data)

    this.on("input", () => {
      this.sub.setToData(this.innerText)
    })

    const editEventListener = [] as EventListener[]
    const stopPropergationFunc = (e: Event) => {
      e.stopPropagation()
    }

    editEventListener.push(this.on("keydown", stopPropergationFunc, true))


    

    this.editMode.get((edit) => {
      if (edit) {
        this.addClass("edit")
        this.setAttribute("contenteditable", "true")      
      }
      else {
        this.removeClass("edit")
        this.setAttribute("contenteditable", "false")
    
      }
    })



    this.visualUnit.get((evTarget) => {
      for (const listener of editEventListener) listener.target(evTarget)
    }, false)

    this.visualUnit.set(visualUnit) 


    
    const txtNode = this.ownTextNodes().first
    if (txtNode) Object.defineProperty(txtNode, "txt", {value: (...a) => {
      return this.txt(...a)
    }})
  }
  private sub = new Data("").get((s) => {
    super.txt(s)
  }, false)
  txt(): string
  txt(to: Prim, animOnExplicitChange?: boolean): this
  txt(to?: Data<Prim>, animOnExplicitChange?: boolean, animOnDataChange?: boolean): this
  txt(to?: Data<Prim> | Prim, animOnExplicitChange?: boolean, animOnDataChange?: boolean) {
    if (to !== undefined) {
      if (!(to instanceof Data)) {
        console.warn("Text.txt(to) is no instance of Data, hence cannot be edited");
        return super.txt(to as any, animOnExplicitChange, animOnDataChange)
      }
      else {
        this.sub.data(to as Data<string>)
        return this
      }
    }
    else return super.txt(to as any, animOnExplicitChange, animOnDataChange) as any
  }

  public pug(): string {
    return ""
  }
  stl() {
    return require("./text.css").toString()
  }
  
}

declareComponent("text", Text);
