import { Data, DataCollection } from "josm";
import declareComponent from "../../../../../../lib/declareComponent";
import EditAble from "../editAble";

type Type = "password" | "newPassword" | "text" | "email" | "url" | "tel" | "number" | "otp" | {
  type: "otp",
  digits?: number,
  letters?: boolean,
  caseSensetive?: boolean
} | {
  type: "number",
  min?: number,
  max?: number,
  step?: number
} | {
  type: "url",
  startingWith?: string
}

const typeImports = {
  password: "password",
  newPassword: "new-password",
  text: "text",
  email: () => import("./inputTypes/email"),
}

export default class Input extends EditAble {
  constructor(placeholder?: string, type: Type = "text") {
    super(ce("input"), placeholder)

    this.placeholderContainer.prepend(ce("left-gradient"), ce("right-gradient"))

    
    setTimeout(() => {
      // wait till styles get applied. So that scrollData can access correct overflow direction with getComputedStyle
      const scrollStart = this.inputElem.scrollData().tunnel((p) => p === 0) as Data<boolean>
      scrollStart.get((is) => {
        this.componentBody[is ? "addClass" : "removeClass"]("scrollStart")
      })
  
      const scrollEnd = this.inputElem.scrollData(true).tunnel((p) => p >= this.inputElem.scrollWidth -1) as Data<boolean>
      scrollEnd.get((is) => {
        this.componentBody[is ? "addClass" : "removeClass"]("scrollEnd")
      })
    })

    this.type(type)
    
  }
  compartments(to: number | number[]) {

  }
  type(to: Type) {

  }
  public pug(): string {
    return super.pug() + require("./input.pug").default
  }
  stl() {
    return super.stl() + require("./input.css").toString()
  }
  
}

declareComponent("input", Input)
