import { ElementList, ScrollData } from "extended-dom";
import { Data, DataCollection, DataSubscription } from "josm";
import declareComponent from "../../../../../lib/declareComponent";
import Page from "../page"


import "./../../../../form/form"
import "./../../../../image/image"
import "./../../../textBlob/textBlob"
import "./../../../_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import LoadButton from  "./../../../_focusAble/_formUi/_rippleButton/_blockButton/loadButton/loadButton"
import "./../../../_focusAble/_formUi/_rippleButton/_blockButton/selectButton/selectButton"
import "./../../../_icon/lineAccent/lineAccent"
import "./../../../_focusAble/_formUi/_editAble/input/input"
import "./../../../_focusAble/_formUi/_editAble/textArea/textArea"
import Form from "./../../../../form/form";
import lang from "../../../../../lib/lang";
import delay from "delay";





export default class RecordPage extends Page {


  constructor() {
    super("dark")





  }

  pug() {
    return require("./recordPage.pug").default
  }
  
  stl() {
    return super.stl() + require("./recordPage.css").toString()
  }
}

declareComponent("record-page", RecordPage)
