import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"


class NotFoundPage extends Page {
  constructor() {
    super()
    
  }

  protected activationCallback(active: boolean): void {
    
  }
  stl() {
    return super.stl() + require("./notFound.css").toString()
  }
  pug() {
    return require("./notFound.pug").default
  }

}

export default declareComponent("not-found-page", NotFoundPage)