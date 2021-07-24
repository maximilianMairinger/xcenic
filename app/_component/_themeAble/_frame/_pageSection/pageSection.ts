import Frame from "../frame";
import { ScrollData } from "extended-dom"
import { Theme } from "../../themeAble";
import delay from "delay";
import { record as imageRecord } from "../../../image/image"

type ResablePromise<T> = Promise<T> & {res(t: T): Promise<T>}

export default abstract class PageSection extends Frame {
  private collectRecord: () => () => Promise<any>
  constructor(theme?: Theme) {
    debugger
    const done = imageRecord.record()
    super(theme)
    debugger
    this._localScrollProgressData = new Map
    this.collectRecord = done
  }
  public _localScrollProgressData?: Map<"end" | "start" | "center" | number, ResablePromise<ScrollData>>
  public localScrollProgressData(endOfPage: "end" | "start" | "center" | number = "start"): Promise<ScrollData> {
    if (this._localScrollProgressData.has(endOfPage)) return this._localScrollProgressData.get(endOfPage)
    else {
      let r: any
      let p = new Promise((res) => {r = res}) as ResablePromise<ScrollData>
      p.res = r
      this._localScrollProgressData.set(endOfPage, p)
      return p
    }
  }

  async minimalContentPaint() {
    debugger
    await this.collectRecord()()
  }
  

  stl() {
    return super.stl() + require("./pageSection.css").toString()
  }
}