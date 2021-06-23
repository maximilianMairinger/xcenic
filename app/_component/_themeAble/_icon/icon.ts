import ThemeAble from "../themeAble";


export default abstract class Icon extends ThemeAble {
  constructor() {
    super(false)

  }
  stl() {
    return require("./icon.css").toString()
  }
}

