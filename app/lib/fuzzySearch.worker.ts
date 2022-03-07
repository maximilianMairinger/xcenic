import { Index, SearchOptions, IndexSearchResult } from "flexsearch"
import charset from "flexsearch/dist/module/lang/latin/advanced.js";
// import charset from "flexsearch/dist/module/lang/latin/extra.js";


// cannot lazy load cous webpack doesnt support
import en from "flexsearch/dist/module/lang/en.js";
import de from "flexsearch/dist/module/lang/at.js";


const langIndex = {
  en,
  de
}

let index = new Index({
  preset: "match",
  context: true,
  tokenize: "full",
  cache: true,
  charset
})

  

export function setLang(langKey: "en" | "de") {
  index = new Index({
    preset: "match",
    context: true,
    tokenize: "full",
    cache: true,
    charset,
    language: langIndex[langKey]
  });

  for (const key in store) {
    index.add(+key, store[key])
  }
}






let id = -1
const store = {}

export function add(value: string) {
  id++
  store[id] = value
  index.add(id, value as string)
  return id
}

export function update(id: number, to: string) {
  index.update(id, to)
  store[id] = to
}


export function search(query: SearchOptions): Promise<string[]>
export function search(query: string, options?: number, options2?: SearchOptions): Promise<string[]>
export function search(query: string, options?: number | SearchOptions): Promise<string[]>
export function search(query: string | SearchOptions, options?: number | SearchOptions, options2?: SearchOptions): any {
  return index.search(query as any, options as any, options2).map((k) => store[k])
}
