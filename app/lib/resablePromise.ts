export default class ResablePromise<T = any> extends Promise<T> {
  public readonly setteled = false
  public readonly res: (t: T) => void
  public readonly rej: (err: any) => void
  constructor(f?: (res: (t: T) => void, rej: (err: any) => void) => void) {
    super((res, rej) => {
      //@ts-ignore
      this.res = (r) => {
        //@ts-ignore
        this.setteled = true
        res(r)
      }
      //@ts-ignore
      this.rej = (r) => {
        //@ts-ignore
        this.setteled = true
        rej(r)
      }

      if (f) f(this.res, this.rej)
    })

  }
}
