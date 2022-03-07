import { Data, DataBase } from "josm"
import en from "../res/lang/en"

type Lang = typeof en

const def = deepDefault(en, "")

export const currentLanguage = new Data("en") as Data<"en" | "de">

export const lang = new DataBase<{en: Lang, de?: Lang}>({en: en}, {en: def, de: def})(currentLanguage) as any as DataBase<Lang>
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

