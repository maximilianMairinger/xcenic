import { Data, DataCollection } from "josm";
import declareComponent from "../../../../../../../lib/declareComponent";
import Input from "../input";
import flexsearch from "flexsearch"

  

export default class Select extends Input {
  constructor(placeholder?: string) {
    super(placeholder)

    
  }
  public pug(): string {
    return super.pug() + require("./select.pug").default
  }
  stl() {
    return super.stl() + require("./select.css").toString()
  }
  
}

declareComponent("select", Select)
