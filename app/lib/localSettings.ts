import { DataBase, Data } from "josm"

type Key = string
type DefaultValType = string | number | boolean
type Name = string

declare let settings: {[key in string]: any}
//@ts-ignore
window.settings = {}


export function createLocalSettings<DefaultVal extends DefaultValType>(settingsName: Name, defaultVal: DefaultVal): Data<DefaultVal>
export function createLocalSettings<Settings extends {[k in Key]: DefaultValType}>(settingsName: Name, settingsDefault: Settings): DataBase<Settings>
export function createLocalSettings(settingsName: Name, settingsDefault_valDefault: DefaultValType | {[k in Key]: DefaultValType}): any {
  let dat: any

  let val: any
  try {
    val = JSON.parse(localStorage[settingsName])
  }
  catch(e) {}

  if (typeof settingsDefault_valDefault === "object" && settingsDefault_valDefault !== null) {
    if (typeof val !== "object") val = undefined
    dat = new DataBase(val, settingsDefault_valDefault)
    dat((v: any) => {
      localStorage[settingsName] = JSON.stringify(v)
    }, false)
  }
  else {
    dat = new Data(val, settingsDefault_valDefault)
    dat.get((v) => {
      localStorage[settingsName] = JSON.stringify(v)
    }, false)
  }
  return settings[settingsName] =  dat
}

export default createLocalSettings

