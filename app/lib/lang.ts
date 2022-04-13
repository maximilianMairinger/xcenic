import { Data, DataBase } from "josm"
import de from "../res/lang/de"

type Lang = typeof de

const def = deepDefault(de, "")


export const currentLanguage = new Data("de") as Data<"en" | "de">
currentLanguage.get(async (w) => {
  debugger
  const initOb = {}
  initOb[w] = cloneObject(lang())
  superLang(initOb)
  const ob = {}
  ob[w] = (await langIndex[w]()).default
  superLang(ob)
}, false)

const langIndex = {
  en: () => import("./../res/lang/en"),
  de: () => import("./../res/lang/de")
}


setTimeout(() => {
  currentLanguage.set("en")
}, 500)


const initLang = de



const data = {}
data["de"] = initLang


const superLang = new DataBase<{en: Lang, de?: Lang}>(data as any, {en: def, de: def})
export const lang = superLang(currentLanguage) as any as DataBase<Lang>
export default lang

// @ts-ignore
window.lang = lang
// @ts-ignore
window.currentLanguage = currentLanguage





function deepDefault(ob: any, lastKey: string): any {
  const endOb = {}
  for (const k in ob) {
    if (typeof ob[k] === "object") endOb[k] = deepDefault(ob[k], k)
    else endOb[k] = lastKey + " " + k
  }
  return endOb
}

// can also clone recursive objects
function cloneObject(ob: object) {
  const newOb = new (ob as any).constructor()
  for (const key in ob) {
    if (!ob.hasOwnProperty(key)) continue
    if (typeof ob[key] === "object") newOb[key] = cloneObject(ob[key])
    else newOb[key] = ob[key]
  }
  return newOb
}