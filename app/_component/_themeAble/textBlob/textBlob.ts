import declareComponent from "../../../lib/declareComponent";
import { textify } from "../../text/text";
import ThemeAble from "../themeAble";

export default class TextBlob extends ThemeAble {
  private noteElem = textify(this.q("note-header"))
  private headerElem = textify(this.q("h1"))
  private bodyElem = textify(this.q("p"))
  constructor() {
    super(false)
    this.text = this.bodyElem.txt.bind(this.bodyElem)
  }
  heading(to: string) {
    this.headerElem.txt(to)
  }
  note(to: string) {
    this.noteElem.txt(to)
  }
  // //@ts-ignore
  // text(): string
  // //@ts-ignore
  // text(to: string): void
  // //@ts-ignore
  // text(to?: string) {
  //   return this.bodyElem.txt(to)
  // }

  public pug(): string {
    return require("./textBlob.pug").default
  }
  stl() {
    return super.stl() + require("./textBlob.css").toString()
  }
  
}

declareComponent("text-blob", TextBlob)
