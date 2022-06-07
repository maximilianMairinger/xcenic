import Frame from "../frame";
import "../../../text/text"



export default abstract class Page extends Frame {
  stl() {
    return super.stl() + require("./page.css").toString()
  }
}