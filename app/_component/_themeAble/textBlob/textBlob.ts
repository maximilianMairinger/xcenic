import { Data } from "josm";
import keyIndex from "key-index"
import declareComponent from "../../../lib/declareComponent";
import { textify } from "../../text/text";
import ThemeAble from "../themeAble";


export default class TextBlob extends ThemeAble {
  private elems = keyIndex((elemName: string) => textify(this.q(elemName)))
  constructor() {
    super(false)
  }
  heading(to: string) {
    return this.elems("h1").txt(to)
  }
  note(to: string) {
    return this.elems("note-header").txt(to)
  }
  // @ts-ignore
  text(to: string): any {
    return this.elems("p").txt(to)
  }


  public pug(): string {
    return require("./textBlob.pug").default
  }
  stl() {
    return super.stl() + require("./textBlob.css").toString()
  }
  
}

declareComponent("text-blob", TextBlob)
