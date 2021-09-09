import ThemeAble, { Theme } from "../themeAble";
import { prevRecord as prevImageRecord, fullRecord as fullImageRecord } from "../../image/image"

export default abstract class Frame extends ThemeAble<HTMLElement> {
  public readonly active: boolean;
  public readonly initiallyActivated

  private loadFullResImages: () => () => Promise<any>
  private loadPrevResImages: () => () => Promise<any>

  constructor(theme: Theme) {
    const prevResDone = prevImageRecord.record()
    const fullResDone = fullImageRecord.record()
    super(undefined, theme)
    this.loadPrevResImages = prevResDone
    this.loadFullResImages = fullResDone

    this.active = false
    this.initiallyActivated = false
    this.userInitedScrollEvent = true
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
  protected async minimalContentPaint(): Promise<void> {
    await this.loadPrevResImages()()
  }
  protected fullContentPaint(): void | Promise<void> {

  }
  protected async completePaint(): Promise<void> {
    await this.loadFullResImages()()
  }

  protected activationCallback?(active: boolean): void
  protected initialActivationCallback?(): void
  public userInitedScrollEvent: boolean
  public addIntersectionListener?(root: HTMLElement, cb: Function, threshold?: number, rootMargin?: string): void
  public removeIntersectionListener?(root: HTMLElement): void
}