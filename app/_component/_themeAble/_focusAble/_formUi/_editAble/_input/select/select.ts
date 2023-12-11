import { currentLanguage } from "./../../../../../../../lib/lang"
import { loadRecord } from "./../../../../../_frame/frame"
import { Data, DataBase, DataCollection } from "josm";
import declareComponent from "../../../../../../../lib/declareComponent";
import Input from "../input";

  

export default class Select extends Input {

  public selectMode = new DataBase({
    preset: "force",
    options: {
      showOptions: true,
      forceOption: true,
      autoComplete: true
    }
  }) as DataBase<{
    preset: "force" | "optional" | "assistive",
    options: {
      showOptions: boolean,
      forceOption: boolean,
      autoComplete: boolean
    }
  }>

  public textValue: Data<string>
  public possibleValues: Data<string[]>

  constructor(possibleValues: string[] = [], placeholder?: string) {
    super(placeholder)

    this.textValue = this.value
    this.value = new Data(this.textValue.get())


    const selectModeoptions = this.selectMode.options
    this.selectMode.preset.get((preset) => {
      if (preset === "force") {
        selectModeoptions.autoComplete.set(true)
        selectModeoptions.forceOption.set(true)
        selectModeoptions.showOptions.set(true)
      }
      else if (preset === "optional") {
        selectModeoptions.autoComplete.set(true)
        selectModeoptions.forceOption.set(false)
        selectModeoptions.showOptions.set(true)
      }
      else {
        selectModeoptions.autoComplete.set(true)
        selectModeoptions.forceOption.set(false)
        selectModeoptions.showOptions.set(false)
      }
    })



    let fullLoad: Function
    loadRecord.content.add(async () => {
      fullLoad = (await import("./autoComplete")).default(this)
    })

    loadRecord.full.add(async () => {
      fullLoad()
    })

    
    this.possibleValues = new Data(possibleValues)
    
  }

  values(values: string[]) {
    this.possibleValues.set(values)
  }



  public pug(): string {
    return super.pug() + require("./select.pug").default
  }
  stl() {
    return super.stl() + require("./select.css").toString()
  }
  
}

declareComponent("select", Select)
