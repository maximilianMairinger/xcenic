import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"

import "./../../../../_themeAble/_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import BlockButton from "./../../../../_themeAble/_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import Replayer from "rrweb-player"
import { stopRecording, recording } from "./../../../../../record"



class AdminPage extends Page {
  
  constructor() {
    super();
    
    (this.body.button as BlockButton).click(() => {
      // document.body.innerHTML = ""
      stopRecording()
      console.log(recording)

      const replayer = new Replayer({
        props: {
          events: recording
        },
        target: this.componentBody
      });
      replayer.play();
      console.log(replayer)
    })
    

  }


  stl() {
    return super.stl() + require("./adminPage.css").toString() + require("rrweb-player/dist/style.css").toString()
  }
  pug() {
    return require("./adminPage.pug").default
  }

}

export default declareComponent("admin-page", AdminPage)