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
const prev = "PREV"

const reses = [
  prev,
  res
]


const whenPossibleFormats = formats.slice(0, -1)
const fallbackFormat = formats.last


function isExplicitLocation(location: string) {
  const firstSlash = location.indexOf("/")
  if (firstSlash === 0) return true
  if (location[firstSlash + 1] === "/") return true
  return false
}

export default class Image extends Component {
  public readonly loaded: {[key in typeof reses[number]]: Promise<void>} = {}
  private elems: {[key in typeof reses[number]]: {sources: {setSource: (src: string) => void}[], img: HTMLImageElement &  {setSource: (src: string) => void}}} = {}
  constructor(src?: string, forceLoad?: boolean) {
    //@ts-ignore
    super(false)

    for (const res of reses) {
      const sources = []
      const img = ce("img") as HTMLImageElement & {setSource: (to: string) => string}
      //@ts-ignore
      img.crossorigin = "anonymous"
      img.setSource = (to) => img.src = to + fallbackFormat
      

      this.elems[res] = {sources, img}
      

      for (let format of whenPossibleFormats) {
        const source = ce("source") as HTMLSourceElement & {setSource: (to: string) => string}
        source.type = typePrefix + format
        source.setSource = (to: string) => source.srcset = to + format
        sources.add(source)
      }

      sources.add(img as any)

      const bod = ce("picture")
      bod.setAttribute("name", res)
      bod.apd(...sources)
      this.apd(bod)

      this.newLoadedPromise(res)
      
      
    }

    
    if (src) this.src(src, forceLoad)
  }

  private newLoadedPromise(resolution: typeof reses[number]) {
    this.loaded[resolution] = new Promise((res) => {
      this.elems[resolution].img.onload = () => {
        res(); 
        //@ts-ignore
        this.loaded[resolution].done = true
        this.elems[resolution].img.anim({opacity: 1}, 150).then(() => {
          const resIndex = reses.indexOf(resolution)
          if (resIndex !== 0) {
            this.elems[reses[resIndex - 1]].img.anim({opacity: 0}, 150)
            this.elems[resolution].img.anim({filter: "blur(0px)"}, 800)
          }
        })
      }
    })
  }

  src(src?: string, forceLoad: boolean = false): this {
    if (forceLoad) {
      for (const res of reses) {
        const { img, sources } = this.elems[res]
        if ((this.loaded[res] as any).done) this.newLoadedPromise(res)
        if (isExplicitLocation(src)) {
          img.setSource(src)
        }
        else {
          const pointIndex = src.lastIndexOf(".")
          if (pointIndex !== -1) src = src.slice(0, pointIndex)
          sources.Inner("setSource", ["/res/img/dist/" + src + unionSymbol + res + "."])
        }
      }
    }
    else {
      _record.add(() => {
        this.src(src, true)
      })
    }
    return this
  }


  stl() {
    return require("./image.css").toString()
  }

  pug() {
    return require("./image.pug").default
  }

}

declareComponent("image", Image)