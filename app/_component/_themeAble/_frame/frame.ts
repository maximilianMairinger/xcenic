import ThemeAble, { Theme } from "../themeAble";

export default abstract class Frame extends ThemeAble<HTMLElement> {
  public readonly active: boolean = false;
  public readonly initiallyActivated = false
  constructor(theme: Theme) {
    super(undefined, theme)
  }
  public activate() {
    return this.vate(true)
  }
  public deactivate() {
    return this.vate(false)
  }
  
  public vate(activate: false)
  public vate(activate: true)
  public vate(activate: boolean) {
    (this as any).active = activate
    if (this.initialActivationCallback && activate && !this.initiallyActivated) {
      (this as any).initiallyActivated = true
      this.initialActivationCallback()
    }

    if (this.activationCallback) return this.activationCallback(activate)
  }
  
  stl() {
    return require("./frame.css").toString()
  }
  protected abstract minimalContentPaint(): void | Promise<void>
  protected abstract fullContentPaint?(): void | Promise<void>
  protected abstract completePaint?(): void | Promise<void>

  protected activationCallback?(active: boolean): void
  protected initialActivationCallback?(): void
  public userInitedScrollEvent = true
  public addIntersectionListener?(root: HTMLElement, cb: Function, threshold?: number, rootMargin?: string): void
  public removeIntersectionListener?(root: HTMLElement): void
}