import { DataBase } from "josm"
import ger from "../res/lang/ger"
import en from "../res/lang/en"

type Lang = typeof en

export const lang = new DataBase<Lang>(en as Lang, deepDefault(en, ""))
export default lang

// @ts-ignore
window.lang = lang



function deepDefault(ob: any, lastKey: string): any {
  const endOb = {}
  for (const k in ob) {
    if (typeof ob[k] === "object") endOb[k] = deepDefault(ob[k], k)
    else endOb[k] = lastKey + " " + k
  }
  return endOb
}

