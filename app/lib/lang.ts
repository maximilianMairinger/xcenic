import { LinkedList } from "fast-linked-list"
import { Data, DataBase } from "josm"
import merge from "deepmerge"
import { parse, stringify } from "./serialize"
import { cloneKeys, isObjectEmpty } from "./../../server/src/lib/clone"
import projectObject from "project-obj"





const superLang = new DataBase<{en: Lang, de: Lang}>({de: {} as any, en: {} as any})
const network = networkDataBase(superLang, "lang")


let projection = {}
export async function fetch(addProjection: object, withLang: boolean = false) {
  projection = merge(projection, addProjection)
  await network.fetch(withLang ? addProjection : {[currentLanguage.get()]: addProjection})
}





// @ts-ignore
export const currentLanguage = new Data("de") as Data<"en" | "de">
let oldLang = currentLanguage.get()
currentLanguage.get((newLang) => {
  if (isObjectEmpty(superLang[newLang]())) {
    superLang({[newLang]: cloneKeys(lang())})
    network.fetch({[newLang]: projection, [oldLang]: false})
  }

  oldLang = newLang
}, false)




export const lang = superLang(currentLanguage) as any as DataBase<Lang>
export default lang

// @ts-ignore
window.lang = lang
// @ts-ignore
window.currentLanguage = currentLanguage




// type only
import de from "./../res/lang/de"
import networkDataBase from "./networkDataBase"
type Lang = typeof de