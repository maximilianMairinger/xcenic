import delay from "tiny-delay"
import Component from "../component"
import declareComponent from "./../../lib/declareComponent"




export default class LoadingSpinner extends Component<false> {
  
  constructor() {
    super()
    

  }

  connectedCallback() {
    this.body.spinner.anim([{offset: 0, rotate: 0}, {offset: 1, rotate: 360}], {duration: 1000, iterations: Infinity, easing: "linear"})
  }
  


  stl() {
    return super.stl() + require("./loadingSpinner.css").toString()
  }

  pug() {
    return require("./loadingSpinner.pug").default
  }

}

declareComponent("loading-spinner", LoadingSpinner)