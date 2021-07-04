import HighlightAbleIcon from "../highlightAbleIcon";
import declareComponent from "../../../../../lib/declareComponent";

export default class Contact extends HighlightAbleIcon {
  constructor() {
    super()

  }

  pug() {
    return require("./contact.pug").default
  }
}

declareComponent("contact-icon", Contact)
