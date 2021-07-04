import HighlightAbleIcon from "../highlightAbleIcon";
import declareComponent from "../../../../../lib/declareComponent";

export default class ThoughtBubble extends HighlightAbleIcon {
  constructor() {
    super()

  }

  pug() {
    return require("./thoughtBubble.pug").default
  }
}

declareComponent("thought-bubble", ThoughtBubble)
