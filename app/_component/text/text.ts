import { EventListener, Prim } from "extended-dom";
import { Data, DataCollection, DataSubscription } from "josm";
import declareComponent from "../../lib/declareComponent";
import Component from "../component";


export function textify(element: HTMLElement, visualUnit?: HTMLElement) {
  const txtELem = new Text(undefined, visualUnit)
  element.apd(txtELem)
  const oriTxt = txtELem.txt.bind(txtELem)
  // @ts-ignore
  element.txt = element.text = (...a) => {
    oriTxt(...a)
    return element
  };
  (element as HTMLElement & {textElement: Text}).textElement = txtELem
  return element as HTMLElement & {textElement: Text}
}

// todo: make it only plaintext


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
      if (this.innerText === "") {
        this.sub.setToData(undefined)
        super.txt((this.sub.data() as Data<string>).get())
      }
      else this.sub.setToData(this.innerText)  
    })

    this.on("keydown", (e) => {
      e.preventDefault()
      this.blur()
    }, true)

    

    const editEventListener = [] as EventListener[]
    const stopPropergationFunc = (e: Event) => {
      e.stopPropagation()
    }

    editEventListener.push(this.on("keydown", stopPropergationFunc, true))






    
    new DataCollection(this.editMode, this.canBeEdited).get((edit, canBeEdited) => {
      if (edit && canBeEdited) {
        this.addClass("edit")
        this.setAttribute("contenteditable", "plaintext-only")      
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
  private canBeEdited = new Data(false)
  txt(): string
  txt(to: Prim, animOnExplicitChange?: boolean): this
  txt(to?: Data<Prim>, animOnExplicitChange?: boolean, animOnDataChange?: boolean): this
  txt(to?: Data<Prim> | Prim, animOnExplicitChange?: boolean, animOnDataChange?: boolean) {
    if (to !== undefined) {
      if (!(to instanceof Data)) {
        this.canBeEdited.set(false)
        return super.txt(to as any, animOnExplicitChange, animOnDataChange)
      }
      else {
        this.canBeEdited.set(true)
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
