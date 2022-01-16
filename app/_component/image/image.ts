import Component from "../component"
import declareComponent from "./../../lib/declareComponent"
import { loadRecord } from "../_themeAble/_frame/frame"

const unionSymbol = "@"
const typePrefix = "image/"


const formats = [
  "avif",
  "webp",
  "jpg"
]

const fullRes = "3K"
const prevRes = "PREV"

const reses = [
  prevRes,
  fullRes
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
  private elems: {[key in typeof reses[number]]: {picture: HTMLPictureElement, sources: {setSource: (src: string) => void}[], img: HTMLImageElement &  {setSource: (src: string) => void}}} = {}
  constructor(src?: string, forceLoad?: boolean) {
    //@ts-ignore
    super(false)

    for (const res of reses) {
      const sources = []
      const img = ce("img") as HTMLImageElement & {setSource: (to: string) => string}
      //@ts-ignore
      img.crossorigin = "anonymous"
      img.setSource = (to) => img.src = to + fallbackFormat
      
      const picture = ce("picture")

      this.elems[res] = {sources, img, picture}
      

      for (let format of whenPossibleFormats) {
        const source = ce("source") as HTMLSourceElement & {setSource: (to: string) => string}
        source.type = typePrefix + format
        source.setSource = (to: string) => source.srcset = to + format
        sources.add(source)
      }

      sources.add(img as any)

      
      picture.setAttribute("name", res)
      picture.apd(...sources)
      this.apd(picture)

      this.newLoadedPromise(res)
      
      
    }

    this.elems[reses.first].img.setAttribute("importance", "high")

    
    if (src) this.src(src, forceLoad)
  }

  private newLoadedPromise(resolution: typeof reses[number]) {
    this.loaded[resolution] = new Promise((res) => {
      this.elems[resolution].img.onload = () => {
        //@ts-ignore
        this.loaded[resolution].done = true
        res();
        this.elems[resolution].img.anim({opacity: 1}, 150).then(() => {
          const resIndex = reses.indexOf(resolution)
          if (resIndex !== 0) {
            this.elems[reses[resIndex - 1]].img.anim({opacity: 0}, 150)
            this.elems[resolution].img.anim({filter: "blur(0px)"}, 800)
            this.elems[resolution].img.anim({scale: 1}, 800)
          }
        })
      }
    })
  }


  private loadSrc(src: string, res: typeof reses[number]): Promise<void> {
    const { img, sources } = this.elems[res]
    
    
    if ((this.loaded[res] as any).done) this.newLoadedPromise(res)
    this.loaded[res].then(() => {
      

      const resIndex = reses.indexOf(res)
      if (resIndex === 0) {
        this.elems[res].img.css({opacity: 1})
      }
      else {
        this.elems[res].img.anim({opacity: 1}, 150).then(() => { 
          this.elems[reses[resIndex - 1]].img.anim({opacity: 0}, 150)
          this.elems[res].img.anim({filter: "blur(0px)"}, 800)
        })
      }
    })

    if (isExplicitLocation(src)) {
      img.setSource(src)
    }
    else {
      const pointIndex = src.lastIndexOf(".")
      if (pointIndex !== -1) src = src.slice(0, pointIndex)
      sources.Inner("setSource", ["/res/img/dist/" + src + unionSymbol + res + "."])
    }

    return this.loaded[res]
  }
    




  src(src?: string, forceLoad: boolean = false): this {
    if (forceLoad) {
      for (const res of reses) {
        this.loadSrc(src, res)
      }
    }
    else {
      loadRecord.minimal.add(() => {
        return this.loadSrc(src, prevRes)
      })
      loadRecord.full.add(() => {
        return this.loadSrc(src, fullRes)
      })
    }
    return this
  }


  stl() {
    return super.stl() + require("./image.css").toString()
  }

  pug() {
    return require("./image.pug").default
  }

}

declareComponent("image", Image)