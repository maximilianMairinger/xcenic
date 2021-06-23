const loadStates = ["minimalContentPaint", "fullContentPaint", "completePaint"]
const preloadToLoadStatusAtIndex = 1

export default function init<Func extends () => Promise<any>>(resources: ImportanceMap<any, any>, globalInitFunc?: (instance: any, index: number) => void | Promise<void>) {
  const resolvements = new Map<Import<any, any>, (load: () => Promise<{default: {new(): any}}>, index: number, state: (typeof loadStates)[number]) => void>();
  const resourcesMap = new ResourcesMap();

  resources.forEach((e: () => Promise<object>, imp) => {

    if (imp.val !== undefined) {
      let instanc: any
      let resProm: any
      let prom = new Promise((res) => {
        resolvements.set(imp, async (load: () => Promise<{default: {new(): any}}>, index: number, state?) => {
          let loadState = async (load: () => Promise<{default: {new(): any}}>, index: number, state?) => {
            if (state) {
              if (!instance[state].done.started) {
                instance[state].done.started = true
                await instance[state]()
                instance[state].done.res()
              }
            }
            
          }

          let instanceProm = ((async () => imp.initer((await load()).default)))();
          (async () => {
            async function loado(state) {
              let instance = await instanceProm
              if (!instance[state]) {
                instance[state] = () => {}
                const p = instance[state].done = Promise.resolve() as any
                p.yet = p.started = true
              }
              else {
                let r: Function
                const p = instance[state].done = new Promise((res) => {r = res}) as any
                p.started = false
                p.res = () => {
                  p.yet = true
                  r()
                }
              }
            }
            if (state) {
              await loado(state)
            }
            else {
              const oldLoad = loadState
              loadState = async (load: () => Promise<{default: {new(): any}}>, index: number, state?) => {
                if (state) {                
                  await loado(state)
                  await oldLoad(load, index, state)
                }
              }

            }
          })()


          resolvements.set(imp, loadState)

          
          let instance = await instanceProm
          
          
          if (globalInitFunc !== undefined) await globalInitFunc(instance, index);

          await loadState(load, index, state)
          
          if (dontRes) {
            instanc = instance
            resProm = res
          }
          else {
            res(instance)
          }
        })
      })

      let dontRes = false

      //@ts-ignore
      prom.priorityThen = async function(cb?: Function, deepLoad?: boolean) {
        dontRes = true
        await resources.superWhiteList(imp, deepLoad)
        let result: any
        if (cb) result = await cb(instanc)
        if (resProm) resProm(instanc)
        return result !== undefined ? result : instanc
      }
      //@ts-ignore
      resourcesMap.add(imp.val, prom);
    }
  });

  //@ts-ignore
  resourcesMap.reloadStatusPromises();


  (resources as any).resolve(<Mod>(load: () => Promise<{default: {new(): Mod}}>, imp: Import<string, Mod>, index: number, state?: any) => {
    return resolvements.get(imp)(load, index, state)
  })
  


  return {
    resourcesMap,
    importanceMap: resources
  }
}

import slugify from "slugify"
import { dirString } from "./domain";
export const slugifyUrl = (url: string) => url.split(dirString).replace((s) => slugify(s)).join(dirString)


export type PriorityPromise<T = any> = Promise<T> & {priorityThen: (cb?: (instance: any) => void, deepLoad?: boolean) => any}

export class BidirectionalMap<K, V> extends Map<K, V> {
  public reverse: Map<V, K> = new Map

  set(k: K, v: V) {
    this.reverse.set(v, k)
    return super.set(k, v)
  }
  delete(k: K) {
    this.reverse.delete(this.get(k))
    return super.delete(k)
  }
}

class MultiKeyMap<K, V> {
  private index: {key: K, val: V}[]
  constructor(...index: {key: K, val: V}[]) {
    this.index = index
  }
  add(key: K, val: V) {
    this.index.add({key, val})
  }
  get(key: K, nth: number = 1) {
    for (let e of this.index) {
      if (e.key === key) {
        nth--
        if (nth === 0) return e.val
      }
    }
  }
  has(key: K, nth: number = 1) {
    return !!this.get(key, nth)
  }
  forEach(cb: (val: V, key: K) => void) {
    for (let e of this) {
      cb(e.val, e.key)
    }
  }
  *[Symbol.iterator](): Iterator<{key: K, val: V}, {key: K, val: V}, any> {
    for (let e of this.index) {
      yield e
    }
    return this.index.last
  }
  entries() {
    return this[Symbol.iterator]()
  }
}

export class ResourcesMap extends MultiKeyMap<string, PriorityPromise> {
  public fullyLoaded: Promise<any>
  public anyLoaded: Promise<any>
  public loadedIndex: BidirectionalMap<string, any>
  constructor(...index: {key: string, val: PriorityPromise}[]) {
    let toBeAdded = []
    for (let e of index) {
      toBeAdded.add({key: slugifyUrl(e.key), val: e.val})
    }
    super(...toBeAdded)
    this.loadedIndex = new BidirectionalMap
  }

  public getLoadedKeyOfResource(resource: any) {
    return this.loadedIndex.reverse.get(resource)
  }
  public getLoaded(resource: any) {
    return this.loadedIndex.get(resource)
  }

  private reloadStatusPromises() {
    let proms = []
    this.forEach((e) => {
      proms.add(e)
    })
    
    this.fullyLoaded = Promise.all(proms)
    this.anyLoaded = Promise.race(proms)
  }
  public add(key: string, val: PriorityPromise) {
    return super.add(slugifyUrl(key), val)
  }
}



export class ImportanceMap<Func extends () => Promise<{default: {new(): Mod}}>, Mod> extends Map<Import<string, Mod>, Func> {
  private importanceList: Import<string, Mod>[] = [];

  constructor(...index: {key: Import<string, Mod>, val: Func}[]) {
    super()
    for (let e of index) {
      this.importanceList.add(e.key)
      super.set(e.key, e.val)
    }
  }

  private resolver: (e: Func, key: Import<string, Mod>, index: number, state?: (typeof loadStates)[number]) => any
  protected resolve(resolver: ImportanceMap<Func, Mod>["resolver"]) {
    this.resolver = resolver
    if (this.superWhiteListCache) {
      this.superWhiteList(this.superWhiteListCache.imp, this.superWhiteListCache.deepLoad)
    }
    if (!this.whiteListedImports.empty) {
      this.startResolvement()
    }
  }

  private async startResolvement() {
    if (!this.resolver) return
    const whiteList = this.whiteListedImports
    whiteList.sort((a, b) => b.importance - a.importance)
    for (let j = 0; j < preloadToLoadStatusAtIndex; j++) {
      const state = loadStates[j];
      for (let i = 0; i < whiteList.length; i++) {
        if (whiteList !== this.whiteListedImports) return
        while (this.superWhiteListDone) await this.superWhiteListDone
        await this.resolver(this.get(this.whiteListedImports[i]), this.whiteListedImports[i], this.importanceList.indexOf(this.whiteListedImports[i]), state);
      }
    }
  }

  public getByString(key: string): {key: Import<string, Mod>, val: Func} {
    let kk: any, vv: any;
    this.forEach((v,k) => {
      if (k.val === key) {
        vv = v;
        kk = k;
      }
    });
    if (!kk || !vv) throw new Error("No such value found")
    return {key: kk, val: vv};
  }
  public set(key: Import<string, Mod>, val: Func): this {
    this.importanceList.add(key);
    super.set(key, val);
    return this;
  }

  public whiteList(...imp: Import<string, Mod>[]) {
    this.whiteListedImports = imp
    this.startResolvement()
  }
  public whiteListAll() {
    this.whiteList(...this.importanceList)
  }

  private superWhiteListCache: {imp: Import<string, Mod>, deepLoad: boolean}
  public superWhiteList(imp: Import<string, Mod>, deepLoad: boolean = false) {
    this.superWhiteListCache = {imp, deepLoad}
    if (!this.resolver) return
    let minimalReqLoaded: Promise<void> = new Promise((res) => {
      let mySuperWhiteListDone = this.superWhiteListDone = new Promise(async (next) => {
        const v = this.get(imp)
        if (deepLoad) {
          if (this.whiteListedImports.includes(imp)) this.whiteListedImports.rmV(imp)
          for (let state of loadStates) {
            await this.resolver(v, imp, this.importanceList.indexOf(imp), state)
            res()
            if (mySuperWhiteListDone !== this.superWhiteListDone) {
              if (state !== loadStates.last) this.whiteListedImports.add(imp)
              return
            }
          }
        }
        else {
          await this.resolver(v, imp, this.importanceList.indexOf(imp))
          res()
        }
        
        this.superWhiteListDone = undefined
        next()
      })
    })
    
    return minimalReqLoaded
  }

  public whiteListedImports = []
  private superWhiteListDone: Promise<void>
}

export class Import<T, Mod> {
  constructor(public val: T, public importance: number, public initer: (mod: {new(): Mod}) => Mod) {

  }
}