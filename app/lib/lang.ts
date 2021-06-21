import { DataBase } from "josm"
import ger from "../res/lang/ger"
import en from "../res/lang/en"

type Lang = typeof en


export const lang = new DataBase<Lang>(en as Lang)
export default lang

