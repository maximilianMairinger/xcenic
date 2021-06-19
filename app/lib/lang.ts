import { DataBase } from "josm"
import ger from "./../res/lang/ger.json"

interface Lang {
  "xcenic": {
    "longName": "Xcenic"
  }
}



export const lang = new DataBase<Lang>(ger as Lang)
export default lang

