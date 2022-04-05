export default class ResablePromise<T = any> extends Promise<T> {
  public readonly setteled = false
  public readonly res: (t: T) => void
  public readonly rej: (err: any) => void
  constructor(f?: (res: (t: T) => void, rej: (err: any) => void) => void) {
    let rres: any
    let rrej: any
    super((res, rej) => {
      //@ts-ignore
      rres = (r) => {
        //@ts-ignore
        this.setteled = true
        res(r)
      }
      //@ts-ignore
      rrej = (r) => {
        //@ts-ignore
        this.setteled = true
        rej(r)
      }

      if (f) f(rres, rrej)
    })

    this.res = rres
    this.rej = rrej
  }
}
