import { DataBase, Data } from "josm"

type Key = string
type DefaultValType = string | number | boolean
type Name = string

type AnyValType = AnyObjectType | DefaultValType
type AnyObjectType = {[key: string]: AnyValType | (AnyValType)[]}

declare let settings: {[key in string]: any}
//@ts-ignore
window.settings = {}


export function createLocalSettings<DefaultVal extends DefaultValType>(settingsName: Name, defaultVal: DefaultVal): Data<DefaultVal>
export function createLocalSettings<Settings extends AnyObjectType>(settingsName: Name, settingsDefault: Settings): DataBase<Settings>
export function createLocalSettings(settingsName: Name, settingsDefault_valDefault: DefaultValType | AnyObjectType | Data<DefaultValType> | DataBase<AnyObjectType>): any {
  // if (settingsName === "localScrollPos@") debugger
  let dat: any

  let val: any
  try {
    val = JSON.parse(localStorage[settingsName])
  }
  catch(e) {}

  const getFunc = (v: any) => {
    localStorage[settingsName] = JSON.stringify(v)
  }

  if (typeof settingsDefault_valDefault === "object" && settingsDefault_valDefault !== null) {
    if (typeof val !== "object") val = undefined
    dat = new DataBase(val, settingsDefault_valDefault);
    (dat as DataBase)(getFunc, true, false)
  }
  else {
    dat = new Data(val, settingsDefault_valDefault)
    dat.get(getFunc, false)
  }
  return settings[settingsName] =  dat
}
export default createLocalSettings

