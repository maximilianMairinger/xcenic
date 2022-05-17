import { DataBase, internalDataBaseBridge, dataBaseParsingId as parsingId } from "josm"
import { cloneKeys } from "../../server/src/lib/clone"
import { stringify, parse } from "./../lib/serialize"
import { MultiMap } from "./multiMap"




export default function networkDataBase(urlPath: string | URL, fetchQuery: object = {}) {
  const url = urlPath instanceof URL ? urlPath.toString() : location.protocol === "https:" ? "wss://" : "ws://" + location.host + (urlPath.startsWith("/") ? urlPath : "/" + urlPath)
  const ws = new WebSocket(url)
  const dataBase = new DataBase({})
  const sub = dataBase((full, diff) => {
    ws.send(stringify({set: diff}))
  }, true, false)

  ws.addEventListener("message", (rawMessage) => {
    const msg = parse(rawMessage.data)
    sub.setToDataBase(msg)
  })
  ws.addEventListener("open", () => {
    const msg = stringify({get: fetchQuery})
    console.log("open", msg)
    ws.send(msg)
  })
  ws.addEventListener("close", () => {
    console.log("closing")
  })
  return dataBase
} 


type InternalDataBase<T> = {}

function findRoot(db: InternalDataBase<{}>, findSub: any) {
  const initChildMap = getParents(db)
  for (const sub of (db as any).subscriptionsOfChildChanges) {
    if (sub === findSub) return toPointer([])
  }

  
  let lastVal: any
  let lastVals: any

  const keys = [...initChildMap.keys()]
  const removeLastVal = keys.length > 1 // is root if this is 1
  if (removeLastVal) {
    // we dont want to look into the last path, as it is the one that was just added.
    const lastKey = keys[keys.length - 1]
    lastVals = initChildMap.get(lastKey)
    lastVal = lastVals.pop()
  } 
  


  try {
    const initEntries = [...initChildMap.entries()]

    let currentLevel = initEntries.map(e => e[0])
    let currentPath = initEntries.map(e => [e[1][0].key]) as any[]


  
  
  
    let nextLevel: typeof currentLevel
    let nextPath: typeof currentPath
  
    while(true) {
      nextPath = []
      nextLevel = []
  
      let i = 0
      for (const db of currentLevel) {
        for (const sub of (db as any).subscriptionsOfChildChanges) {
          if (sub === findSub) return toPointer(currentPath[i])
        }
  
  
        const myNextLevelMap = getParents(db)
        const fullPath = currentPath[i]
        for (const [dbDeep, deepPaths] of myNextLevelMap) {
          nextPath.push([deepPaths[0].key, ...fullPath])
          nextLevel.push(dbDeep)
        }
  
        i++
      }
      
      currentLevel = nextLevel
      currentPath = nextPath
    }
  }
  finally {
    if (removeLastVal) {
      lastVals.push(lastVal)
    }
  }
}


function getParents(db: InternalDataBase<{}>) {
  return (db as any).beforeDestroyCbs as MultiMap<InternalDataBase<{}>, {key: string}>
}

export const resolveOldRecursion = (() => {
  let known: Map<any, any>
  return function resolveOldRecursion(diff: object, rootSub: any) {
    known = new Map()
    return resolveOldRecursionRec(diff, rootSub)
  }

  function resolveOldRecursionRec(diff: object, rootSub: any) {
    if (known.has(diff)) return known.get(diff)
    const res = {}
    known.set(diff, res)
    for (let dk in diff) {
      let val = diff[dk]
      if (diff[dk] instanceof Object) {
        if (val[parsingId] !== undefined) {
          const db = val[parsingId][internalDataBaseBridge] as InternalDataBase<{}>
          const parents = getParents(db)
          if (parents.size >= 2  || ((db as any).isRoot && parents.size === 1)) {
            res[dk] = { $ref: findRoot(db, rootSub) }
          }
          else res[dk] = val
        }
        else {
          res[dk] = resolveOldRecursionRec(val, rootSub)
        }
      }
      else {
        if (dk === "$ref" && typeof val === "string" && val.startsWith("#")) val = "#" + val
        res[dk] = val
      }
    }
    return res
  }
})()


export function mergeOldRecursionToDB(rootStore: object) {
  let known: Set<any>
  function rec(diff: object) {
    if (diff instanceof Object) {
      if (known.has(diff)) return
      known.add(diff)

      for (const key in diff) {
        const val = diff[key]
        if (key === "$ref" && typeof val === "string") {
          if (val.startsWith("##")) diff[key] = val.slice(1)
          else if (val.startsWith("#")) {
            const path = resolvePointer(val)
            
            let c = rootStore
            for (const entry of path) {
              c = c[entry]
            }
            return c
          }
        }
        else {
          const ret = rec(diff[key])
          if (ret !== undefined) diff[key] = ret
        }
      }
    }
  }
  return function mergeOldRecursion(diff: object) {
    known = new Set()
    rec(diff)
  }
}


export const toPointer = (parts) => '#' + ["", ...parts].map(part => String(part).replace(/~/g, '~0').replace(/\//g, '~1')).join('/')
export const resolvePointer = (pointer) => {
  let p = pointer.slice(1)
  const ar = []
  if (p === "") return ar
  p = p.slice(1)
  for (const part of p.split('/').map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'))) {
    ar.push(part)
  }
  return ar
}

