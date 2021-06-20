import Icon from "../icon";


const highlightClassString = "highlight"

export default abstract class HighlightAbleIcon extends Icon {
  constructor(strength?: "strong" | "weak") {
    super(strength)
  }
  public highlight() {
    return this.addClass(highlightClassString)
    
  }
  public downlight() {
    return this.removeClass(highlightClassString)
  }

  stl() {
    return super.stl() + require("./highlightAbleIcon.css").toString()
  }
}
