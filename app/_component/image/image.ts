import Component from "../component"
import declareComponent from "./../../lib/declareComponent"
import { InstanceRecord } from "../../lib/record"
import { ElementList } from "extended-dom"
const _record = new InstanceRecord(() => console.warn("img load without init proxy"))
export const record = _record as Omit<typeof _record, "add">
const unionSymbol = "@"
const typePrefix = "image/"

const formats = [
  "avif",
  "webp",
  "jpg"
]

const res = "3K"


const whenPossibleFormats = formats.slice(0, -1)
const fallbackFormat = formats.last


function isExplicitLocation(location: string) {
  const firstSlash = location.indexOf("/")
  if (firstSlash === 0) return true
  if (location[firstSlash + 1] === "/") return true
  return false
}

export default class Image extends Component {
  public readonly loaded: Promise<void>
  private elems = new ElementList<HTMLElement & {setSource: (to: string) => string}>()
  private img: HTMLImageElement & {setSource: (to: string) => string}
  constructor(src?: string, forceLoad?: boolean) {
    super(ce("picture"))

    for (let format of whenPossibleFormats) {
      const elem = ce("source") as HTMLSourceElement & {setSource: (to: string) => string}
      elem.type = typePrefix + format
      elem.setSource = (to: string) => elem.srcset = to + format
      this.elems.add(elem)
    }

    this.img = ce("img") as HTMLImageElement & {setSource: (to: string) => string}
    //@ts-ignore
    this.img.crossorigin = "anonymous"
    this.img.setSource = (to) => this.img.src = to + fallbackFormat
    this.elems.add(this.img as any)

    this.componentBody.apd(...this.elems)


    
    this.loaded = new Promise((res) => {
      (this.img as any as HTMLImageElement).onload = () => {
        this.img.anim({opacity: 1})
        res()
      }
    })
    
    if (src) this.src(src, forceLoad)
  }


  src(): Promise<string>
  src(src: string, forceLoad?: boolean): this
  src(src?: string, forceLoad: boolean = false) {
    if (src !== undefined) {
      if (forceLoad) {
        if (isExplicitLocation(src)) {
          this.img.src = src
        }
        else {
          const pointIndex = src.lastIndexOf(".")
          if (pointIndex !== -1) src = src.slice(0, pointIndex)
          this.elems.Inner("setSource", ["/res/img/dist/" + src + unionSymbol + res + "."])
        }
        
        
        
      }
      else {
        _record.add(() => {
          this.src(src, true)
        })
      }
      return this
    }
    else return this.loaded.then(() => this.img.currentSrc !== undefined ? this.img.currentSrc : this.img.src)
  }


  stl() {
    return require("./image.css").toString()
  }

  pug() {
    return require("./image.pug").default
  }

}

declareComponent("image", Image)