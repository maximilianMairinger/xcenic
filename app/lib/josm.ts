import { Data as DATA, DataSubscription, DataBaseSubscription } from "josm"
import { DataBase as DATABASE } from "josm"
import { setDataDerivativeIndex, OptionallyExtendedData, OptionallyExtendedDataBase } from "josm"




class NumberData extends DATA<number> {
  static type: number;
  inc(by: number = 1) {
    this.set((this.get() as any + by))
    return this
  }
}

class BooleanData extends DATA<boolean> {
  static type: boolean;
  toggle() {
    this.set(!this.get())
    return this
  }
  not() {
    return this.tunnel(() => !this.get())
  }
}

const { Data: _Data, types: _DataTypes, setDataBaseDerivativeIndex, parseDataBase } = setDataDerivativeIndex(
  NumberData,
  BooleanData
)




const ExDataBase = parseDataBase(DATABASE)

type RemoveCallback = () => void

interface ArrayList<T> extends DATABASE<T[]> {
  forEach(addedCb: (added: T extends object ? DATABASE<T> : DATA<T>) => (DataSubscription<[...any[]]> | (() => void))): DataBaseSubscription<[T[]]>
  add(what: T): RemoveCallback
}

type ArrayListClass<T> = { new(a: any): ArrayList<T>, type: T[] }
const dummyObject = {} as any




class InternalConditionalNormal extends ExDataBase<{conditions: boolean[], mandatory: boolean[], normal: any}> {
  static type: {conditions: boolean[], mandatory: boolean[], normal: any}
  addCondition(intiVal: boolean | Data<boolean> = false) {
    const i = (this.conditions() as any).length
    if (!(intiVal instanceof DATA)) {
      (this.conditions as any).add(intiVal as any)
      return this.conditions[i]
    }
    else {
      (this.conditions as any).add(intiVal.get())
      const dat = this.conditions[i] as any
      intiVal.get((val) => {
        dat.set(val)
      }, false)
    }

    
  }
  addMandatoryCondition(intiVal: boolean | Data<boolean> = false) {
    const i = (this.mandatory() as any).length
    if (!(intiVal instanceof DATA)) {
      (this.mandatory as any).add(intiVal as any)
      return this.mandatory[i]
    }
    else {
      (this.mandatory as any).add(intiVal.get())
      const dat = this.mandatory[i] as any
      intiVal.get((val) => {
        dat.set(val)
      }, false)
    }
  }
}


interface ConditionalNormal extends DATABASE<{conditions: boolean[], mandatory: boolean[], normal: any}> {
  addCondition(data: Data<boolean>): void,
  addCondition(initVal?: boolean): Data<boolean>,

  addMandatoryCondition(data: Data<boolean>): void
  addMandatoryCondition(initVal?: boolean): Data<boolean>,
}

type ConditionalNormalClass = { new(a: any): ConditionalNormal, type: {conditions: boolean[], mandatory: boolean[], normal: any} }

const ConditionalNormal = InternalConditionalNormal as any as ConditionalNormalClass


const { DataBase: _DataBase, types: DataBaseTypes } = setDataBaseDerivativeIndex(
  class ArrayList extends ExDataBase<number[]> {
    static type: number[];
    forEach(addedCb: (added: DATA<number>, i: number) => ((() => void) | DataSubscription<[...any[]]> | void), init: boolean = true): DataBaseSubscription<[object[]]> {
      const destroyMap = new Map<DATA, Function>()

      const sub = this((full, added, removed) => {
        for (const key in added) {
          const numKey = +key
          if (isNaN(numKey)) continue
          const ret = addedCb((this as any)[key], numKey)
          if (ret instanceof DataSubscription) destroyMap.set((this as any)[key], ret.deactivate.bind(ret))
          else if (ret instanceof Function) destroyMap.set((this as any)[key], ret)
        }

        for (const key in removed) {
          const numKey = +key
          if (isNaN(numKey)) continue
          if (destroyMap.has((removed as any)[key])) {
            destroyMap.get((removed as any)[key])()
            destroyMap.delete((removed as any)[key])
          }
        }

      }, false, init)

      return sub as any
    }
    add(what: number) {
      const i = (this() as any as any[]).length
      const ob = {}
      ob[i] = what
      this(ob)
      return () => {
        const ob = {}
        ob[i] = undefined
        this(ob)
      }
    }
  } as never,
  dummyObject as ArrayListClass<object>,
  dummyObject as ArrayListClass<symbol>,
  dummyObject as ArrayListClass<boolean>,
  dummyObject as ArrayListClass<string>,
  dummyObject as ArrayListClass<number>,
  dummyObject as ArrayListClass<number | object | symbol | boolean | string>,


  ConditionalNormal
)



// types



// type DataTypes = {
//   [key in keyof typeof _DataTypes]: typeof _DataTypes[key]
// }

// resolves to...

export type DataTypes = {
  tt: [typeof NumberData];
  ww: [number];
}

// export type DataBaseTypes = {
//   [key in keyof typeof DataBaseTypes]: typeof DataBaseTypes[key]
// }

// resolves to...

export type DataBaseTypes = {
  w: [{conditions: boolean[], mandatory: boolean[], normal: any}, object[], symbol[], boolean[], string[], number[], (string | number | boolean | symbol | object)[]];
  t: [ConditionalNormalClass, ArrayListClass<object>, ArrayListClass<symbol>, ArrayListClass<boolean>, ArrayListClass<string>, ArrayListClass<number>, ArrayListClass<number | object | symbol | boolean | string>];
}



export type Data<Value, _Default extends Value = Value> = OptionallyExtendedData<DataTypes["tt"], DataTypes["ww"], Value, _Default>
export type DataBase<Store extends object> = OptionallyExtendedDataBase<Store, DataBaseTypes["t"], DataBaseTypes["w"], DataTypes["tt"], DataTypes["ww"]>



export const Data = _Data
export const DataBase = _DataBase


