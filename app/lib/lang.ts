import { DataBase } from "josm"
import ger from "../res/lang/ger"

type Lang = typeof ger


export const lang = new DataBase<Lang>(ger as Lang)
export default lang

