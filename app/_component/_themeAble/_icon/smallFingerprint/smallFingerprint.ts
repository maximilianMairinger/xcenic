import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class SmallFingerprintIcon extends Icon {
  pug() {
    return require("./smallFingerprint.pug").default
  }
}

declareComponent("small-fingerprint-icon", SmallFingerprintIcon)
