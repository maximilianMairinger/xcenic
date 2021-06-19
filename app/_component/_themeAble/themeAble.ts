import Component from "../component";

export default abstract class ThemeAble<T extends false | HTMLElement | HTMLAnchorElement = false | HTMLElement> extends Component<T> {
  private themeStyleElement: HTMLStyleElement = ce("style")

  constructor(componentBodyExtension?: HTMLElement | false, theme?: Theme | null) {
    super(componentBodyExtension as any)

    this._childThemeAbles = this.childThemeAbles ? this.q(this.childThemeAbles().join(","), true) as any as ThemeAble[] : []

    if (theme === undefined) theme = "light"
    if (theme) this.setTheme(theme)
    this._childThemeAbles.Inner("theme", [theme])
    
    
    

    if (!(this.componentBody instanceof ShadowRoot)) this.sr.insertBefore(this.themeStyleElement, this.componentBody as HTMLElement)
    else this.shadowRoot.append(this.themeStyleElement)
  }

  private _theme: Theme

  private setTheme(to: Theme) {
    if (this._theme !== to) {
      if (this.currentlyActiveTheme) this.themeStyleElement.html(themeIndex[to])
      this._theme = to
    }
    return this
  }

  private _childThemeAbles: ThemeAble[]
  protected childThemeAbles?(): string[]
  
  theme(): Theme
  theme(to: Theme): this
  theme(to?: Theme): any {
    if (to) {
      this._childThemeAbles.Inner("theme", [to])
      return this.setTheme(to)
    }
    else return this._theme
  }

  public passiveTheme() {
    if (this.currentlyActiveTheme) {
      this.currentlyActiveTheme = false
      this.themeStyleElement.html("")
    }
    return this
  }
  protected currentlyActiveTheme: boolean = true

  public activeTheme() {
    if (!this.currentlyActiveTheme) {
      this.currentlyActiveTheme = true
      this.themeStyleElement.html(themeIndex[this._theme])
    }
    return this
  }

}

export type Theme = keyof typeof themeIndex

const themeIndex = {
  light: require("./light-theme.css"),
  dark: require("./dark-theme.css"),
}


export function negateTheme(theme: Theme): Theme {
  return (
    theme === "dark" ?  "light" : 
    theme === "light" ? "dark" :
    "light"
  )
    
}
