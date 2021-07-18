import Page from "../page";
import * as domain from "./../../../../../lib/domain"
import scrollTo from "animated-scroll-to";
import WaapiEasing from "waapi-easing";
import { PriorityPromise, ResourcesMap } from "../../../../../lib/lazyLoad";
import PageSection from "../../_pageSection/pageSection";
import { EventListener, ScrollData } from "extended-dom";
import { Data, DataCollection, DataSubscription } from "josm";
import { constructIndex } from "key-index"
import HightlightAbleIcon from "../../../_icon/_highlightAbleIcon/highlightAbleIcon"
import { constructAttatchToPrototype } from "attatch-to-prototype"

export const scrollToPadding = -120


const scrollAnimationSpeed = 1150


export type SingleAlias = AliasData | string | string[]

const easing = new WaapiEasing("ease").function


export class AliasData extends Data<string[]> {
  constructor(alias: string | string[]) {
    super(alias instanceof Array ? alias : [alias])
  }

  public set(alias: string | string[]) {
    return super.set(alias instanceof Array ? alias : [alias])
  }
}


export class ScrollProgressAlias {
  public readonly progress: Data<number>
  public readonly aliases: AliasData
  constructor(progress: number | Data<number>, alias: SingleAlias) {
    this.progress = progress instanceof Data ? progress : new Data(progress)
    this.aliases = alias instanceof AliasData ? alias : new AliasData(alias)
  }
}





export class ScrollProgressAliasIndex<Root extends string = string> {
  public readonly root: Data<Root>
  public readonly scrollProgressAliases: Readonly<ScrollProgressAlias[]>
  public readonly aliases: DataCollection<string[][]>

  constructor(root: Root | Data<Root>, scrollProgressAlias: ScrollProgressAlias | Readonly<ScrollProgressAlias[]>) {
    this.root = root instanceof Data ? root : new Data(root)
    this.scrollProgressAliases = scrollProgressAlias instanceof Array ? scrollProgressAlias : [scrollProgressAlias]
    //@ts-ignore
    this.aliases = new DataCollection(...(this.scrollProgressAliases as ScrollProgressAlias[]).Inner("aliases")) as DataCollection<string[][]>
  }

  protected buildReverseAlias(aliasReverses: ReverseAliasIndex) {
    for (let alias of this.scrollProgressAliases) {
      
      let aliasesLength = 0
      //@ts-ignore
      new DataCollection(alias.progress, alias.aliases, this.root).get((progress, aliases: string[], root) => {
        if (aliasesLength !== aliases.length)  {
          aliases.ea((alias) => {
            if (aliasReverses[alias] !== undefined) {
              (aliasReverses[alias] as any).progress.set(progress);
              (aliasReverses[alias] as any).root.set(root);
            }
            else aliasReverses[alias] = new ScrollProgressAliasIndex.Reverse(new Data(progress), new Data(root as string))
          })
        }
        else {
          aliases.ea((alias) => {
            (aliasReverses[alias] as any).progress.set(progress);
            (aliasReverses[alias] as any).root.set(root);
          })
        }
      })
      
    }
  }

  public static Reverse = class {
    constructor(public readonly progress: Data<number>, public readonly root: Data<string>) {}
  }
}

export class SimpleAlias<Root extends string = string> {
  public readonly root: Data<Root>
  public readonly aliases: AliasData

  constructor(root: Root | Data<Root>, aliases: AliasData | string | string[]) {
    this.root = root instanceof Data ? root : new Data(root)
    this.aliases = aliases instanceof AliasData ? aliases : new AliasData(aliases)
  }


  protected buildReverseAlias(aliasReverses: ReverseAliasIndex) {

    let aliasesLength = 0
    //@ts-ignore
    new DataCollection(this.aliases, this.root).get((aliases: string[], root) => {
      if (aliasesLength !== aliases.length) {
        aliases.ea((alias) => {
          aliasReverses[alias] = new SimpleAlias.Reverse(root)
        })
      }
      else {
        aliases.ea((alias) => {
          (aliasReverses[alias] as any).root = root
        })
      }
    })
  }

  
  public static Reverse = class {
    constructor(public readonly root: string) {}
  }
}

export class AliasList {
  public readonly reverseIndex: ReverseAliasIndex = {}
  public aliases: Readonly<Alias[]>
  constructor(...aliases: Readonly<Alias[]>) {
    this.aliases = aliases;

    (aliases as Alias[]).ea((alias) => {
      (alias as Alias & {buildReverseAlias(aliasReverses: ReverseAliasIndex): void}).buildReverseAlias(this.reverseIndex)
    })
  }
  public getAllAliasesByRoot(root: string) {
    return (this.aliases as Alias[]).ea((alias) => {
      if (alias.root.get() === root) return alias
    })
  }
  public aliasify(root: string) {
    let data: Data<string[]> = new Data([root])
    let al = this.getAllAliasesByRoot(root)
    if (al !== undefined) al.aliases.get((...a) => {
      let q: string[] = []
      a.ea((e) => {
        q.add(e.first)
      })
      data.set(q)
    })
    return data
  }

  public getRootOfAlias(alias: string) {
    return this.reverseIndex[alias] ? this.reverseIndex[alias].root : alias
  }
}

type ReverseAliasUnion = (InstanceType<(typeof ScrollProgressAliasIndex)["Reverse"]> | InstanceType<(typeof SimpleAlias)["Reverse"]>)
type ReverseAliasIndex = {[root: string]: ReverseAliasUnion}

export type Alias = ScrollProgressAliasIndex | SimpleAlias


type SectionIndex = {[name in Name]: HTMLElement | QuerySelector}
type Name = string
type FullSectionIndex = ResourcesMap | SectionIndex
export type QuerySelector = string
export default abstract class SectionedPage extends Page {
  protected readonly sectionIndex: ResourcesMap
  public readonly sectionList: Data<string[]>
  private inScrollAnimation: Data<Symbol> = new Data()

  protected scrollToSection: (to?: number, speed?: number, force?: boolean) => Promise<void>
  private scrollToSectionFunctionIndex = constructIndex((section: PageSection) => this.constructScrollTo(section))

  public abstract iconIndex: {[key: string]: HightlightAbleIcon}

  constructor(sectionIndex: FullSectionIndex, protected sectionChangeCallback?: (section: string) => void, protected readonly sectionAliasList: AliasList = new AliasList(), protected readonly mergeIndex: {[part in string]: string} = {}) {
    super()
    
    let that = this
    this.scrollToSection = function(to?: number, speed?: number, force?: boolean) {
      if (!(this instanceof PageSection)) console.warn("Unable to scrollTo this. This is not instanceof PageSection.")
      return that.scrollToSectionFunctionIndex(this)(to, speed)
    }


    let r = this.prepSectionIndex(sectionIndex)
    this.sectionIndex = r.sectionIndex as any
    this.sectionList = r.sectionList as any
    (this.sectionList as Data<string[]>).get((e) => {
      //@ts-ignore
      this.defaultDomain = e.first
    })
  }

  private prepSectionIndex(sectionIndex: any) {
    let map: ResourcesMap

    if (sectionIndex instanceof ResourcesMap) map = sectionIndex
    else {
      map = new ResourcesMap()
      for (let name in sectionIndex) {
        let elem: any
        if (!(sectionIndex[name] instanceof HTMLElement)) elem = this.q(sectionIndex[name] as any)
        else elem = sectionIndex[name]
  
        let prom = Promise.resolve(elem)
        //@ts-ignore
        prom.priorityThen = prom.then
        //@ts-ignore
        map.set(name, prom)
      }
    }

    let dataList: Data<string[]>[] = []
    map.forEach((val, key) => {
      let mer = this.merge(key)
      dataList.add(this.sectionAliasList.aliasify(mer))
    })

    let sectionList: Data<string[]> = new Data()
    new DataCollection(...dataList).get((...dataList) => {
      sectionList.set((dataList as any).flat().distinct())
    })

    return {sectionList, sectionIndex}
  }

  private merge(name: string) {
    return this.mergeIndex[name] ? this.mergeIndex[name] : name
  }

  private lastSectionName: string
  private activateSectionName(name: string) {
    if (this.active) {
      if (this.sectionChangeCallback && this.lastSectionName !== name) this.sectionChangeCallback(name)
      this.lastSectionName = name as string
    }
  }
  
  private activateSectionNameWithDomain(name: string) {
    this.activateSectionName(name)
    domain.set(name, this.domainLevel, false)
  }

  private curSectionProm: Promise<{ pageSection: PageSection, fragments: { rootElem: string, closeUp: string } }>
  protected currentDomainFragment: string
  private verticalOffset: number
  tryNavigationCallback(domainFragment: string) {

    domainFragment = this.merge(domainFragment)
    
    //@ts-ignore
    let fragments: {
      rootElem: string, 
      closeUp: string
    } = {}



    this.verticalOffset = scrollToPadding
    if (this.sectionAliasList.reverseIndex[domainFragment] !== undefined) {
      let reverseAlias = this.sectionAliasList.reverseIndex[domainFragment]
      let originalDomain = domainFragment
      if (reverseAlias instanceof SimpleAlias.Reverse) {
        domainFragment = reverseAlias.root
      }
      else if (reverseAlias instanceof ScrollProgressAliasIndex.Reverse) {
        domainFragment = reverseAlias.root.get()
        // this.verticalOffset += reverseAlias.progress - scrollToPadding + .5
        reverseAlias.progress.get((p) => {
          this.verticalOffset = scrollToPadding + p
        })
      }
      fragments.closeUp = originalDomain
      fragments.rootElem = domainFragment
    }
    else {
      let rootElem = this.sectionAliasList.getRootOfAlias(domainFragment)
      if (rootElem instanceof Data) rootElem = rootElem.get()
      fragments.rootElem = rootElem
      fragments.closeUp = this.sectionAliasList.aliasify(domainFragment).get().first
    }

    const m = this.sectionIndex.get(this.currentDomainFragment = domainFragment)
    this.curSectionProm = new Promise((res) => {
      if (m) m.then((pageSection) => {
        res({pageSection, fragments})
      })
      
    })


    return !!m
  }

  async navigationCallback() {
    let active = this.active
    let scrollAnimation: any

    this.inScrollAnimation.set(scrollAnimation = Symbol())


    let { pageSection: elem, fragments } = await this.curSectionProm

    this.activateSectionName(fragments.closeUp)
    this.currentlyActiveSectionRootName = fragments.rootElem
    
    if (this.currentlyActiveSectionElem) this.currentlyActiveSectionElem.deactivate()
    this.currentlyActiveSectionElem = elem
    this.currentlyActiveSectionElem.activate()

    this.userInitedScrollEvent = false
    if (active) {

      let ls = this.on("keydown", (e) => {
        e.stopImmediatePropagation()
      })
      debugger
      await scrollTo(elem.offsetTop, {
        cancelOnUserAction: true,
        verticalOffset: this.verticalOffset,
        speed: scrollAnimationSpeed,
        elementToScroll: this,
        easing
      })

      ls.deactivate()

    }
    else {
      setTimeout(() => {
        this.scrollTop = this.verticalOffset + elem.offsetTop
      })
    }

    
    
    
    if (scrollAnimation === this.inScrollAnimation.get()) {
      this.inScrollAnimation.set(undefined)
      this.userInitedScrollEvent = true
    }
  }



  private firstDomain: string
  private mainIntersectionObserver: IntersectionObserver
  private currentlyActiveSectionRootName: string
  private intersectingIndex: Element[] = []
  private currentlyActiveSectionElem: PageSection
  initialActivationCallback() {



    let globalToken: Symbol
    let aliasSubscriptions: DataSubscription<unknown[]>[] = []
    let localSegmentScrollDataIndex = constructIndex((pageSectionElement: PageSection) => constructIndex((endOfPage: "start" | "end" | "center" | number) => {
      if (endOfPage === "start") return this.scrollData().tunnel(prog => prog - pageSectionElement.offsetTop) as ScrollData 
      if (endOfPage === "end") return this.scrollData().tunnel(prog => prog - pageSectionElement.offsetTop + this.innerHeight()) as ScrollData
      if (endOfPage === "center") return this.scrollData().tunnel(prog => prog - pageSectionElement.offsetTop + this.innerHeight() / 2) as ScrollData
      if (typeof endOfPage === "number") return this.scrollData().tunnel(prog => prog - pageSectionElement.offsetTop + this.innerHeight() * endOfPage) as ScrollData
    }))

    // ----------->

    this.mainIntersectionObserver = new IntersectionObserver(async (c) => {
      c.ea((q) => {
        if (q.isIntersecting) { 
          if (Math.abs(0 - q.boundingClientRect.y) > Math.abs(q.rootBounds.y - q.boundingClientRect.bottom)) {
            this.intersectingIndex.inject(q.target, 0)
          }
          else {
            this.intersectingIndex.add(q.target)
          }
        }
        else {
          
          try {
            this.intersectingIndex.rmV(q.target)
          }
          catch(e) {

          }
        }
      })

      let elem = this.intersectingIndex.first as PageSection


      if (!this.inScrollAnimation.get()) {
        let myToken = globalToken = Symbol("Token")

        // TODO: Optimize look into new methods of sectionIndex; 
        this.sectionIndex.forEach(async (val, root) => {
          if ((await val) === elem) {
            if (myToken !== globalToken) return
            this.currentlyActiveSectionRootName = root


            if (this.currentlyActiveSectionElem !== elem) {
              if (this.currentlyActiveSectionElem !== undefined) this.currentlyActiveSectionElem.deactivate()
              elem.activate()
              this.currentlyActiveSectionElem = elem
            }

            aliasSubscriptions.Inner("deactivate", [])
            aliasSubscriptions.clear()


            root = this.merge(root)
            let alias = this.sectionAliasList.getAllAliasesByRoot(root)
            if (alias) {

              if (alias instanceof SimpleAlias) {
                let sub = new DataSubscription(alias.aliases.tunnel(aliases => aliases.first), this.activateSectionNameWithDomain.bind(this), false)
                //@ts-ignore
                aliasSubscriptions.add(this.inScrollAnimation.get((is) => {
                  if (is) sub.activate()
                  else sub.deactivate()
                }))
                aliasSubscriptions.add(sub)
              }
              else if (alias instanceof ScrollProgressAliasIndex) {
                let currentlyTheSmallestWantedProgressTemp = Infinity
                let currentlyTheSmallestWantedProgress = new Data(currentlyTheSmallestWantedProgressTemp)
                //@ts-ignore
                aliasSubscriptions.add(new DataCollection(...(alias.scrollProgressAliases as ScrollProgressAlias[]).Inner("progress")).get((...wantedProgresses) => {
                  currentlyTheSmallestWantedProgressTemp = Infinity
                  
                  wantedProgresses.ea((wantedProgress) => {
                    if (wantedProgress < currentlyTheSmallestWantedProgressTemp) currentlyTheSmallestWantedProgressTemp = wantedProgress
                  })

                  currentlyTheSmallestWantedProgress.set(currentlyTheSmallestWantedProgressTemp)
                }))

                let lastActiveName: Data<string> = new Data()

                for (let i = 0; i < alias.scrollProgressAliases.length; i++) {
                  const q = alias.scrollProgressAliases[i] as ScrollProgressAlias
                  let nextProg: Data<number> = alias.scrollProgressAliases[i + 1] as any
                  if (nextProg === undefined) nextProg = new Data(Infinity)
                  else nextProg = (nextProg as any).progress

                  let isSmallest = false
                  //@ts-ignore
                  aliasSubscriptions.add(new DataCollection(currentlyTheSmallestWantedProgress, q.progress).get((smallestProg, thisProg) => {
                    isSmallest = smallestProg === thisProg
                  }))

                  
                  let nameData = q.aliases.tunnel(aliases => aliases.first)

                  let sub = new DataSubscription(new DataCollection(nameData, q.progress, nextProg, localSegmentScrollDataIndex(elem)(.4) as any as Data<number>) as any, (name: string, wantedProgress, nextProg, currentProgress) => {
                    if (isSmallest) {
                      wantedProgress = -Infinity
                    }
                    
                    if (wantedProgress <= currentProgress && nextProg > currentProgress) {
                      lastActiveName.set(name)
                      this.activateSectionNameWithDomain(name)
                    }
                  })
                  
                  //@ts-ignore
                  aliasSubscriptions.add(sub)
                  //@ts-ignore
                  aliasSubscriptions.add(new DataCollection(lastActiveName, nameData, this.inScrollAnimation).get((currentName, name, inScrollAnimation) => {
                    let deactivate = currentName === name || inScrollAnimation
                    if (deactivate) sub.deactivate()
                    else sub.activate()
                  }))
                }

              }

            }
            else this.activateSectionNameWithDomain(root)

            
            
          }
        })
      }
    }, {
      threshold: 0,
      rootMargin: "-50%"
    })

    this.sectionIndex.forEach(async (section: Promise<PageSection>) => {
      let sec = await section
      
      sec._localScrollProgressData.forEach((prom, key) => {
        prom.res(localSegmentScrollDataIndex(sec)(key))
      })
      

      sec.localScrollProgressData = (endOfPage: "start" | "end" | "center" | number) => {
        return Promise.resolve(localSegmentScrollDataIndex(sec)(endOfPage))
      }
    })
  }

  private customIntersectionObserver: Map<HTMLElement, EventListener> = new Map

  public async addIntersectionListener(obsElem: HTMLElement, cb: (section: PageSection) => void, threshold: number = .5) {

    let lastHit: PageSection
    let sectionIndex = await this.sectionIndex as any

    let f = async () => {
      let obs = obsElem.getBoundingClientRect();
      let ajustedHeight = obs.height * threshold
      let upperHit = obs.top + ajustedHeight
      let lowerHit = obs.bottom - ajustedHeight
      sectionIndex.forEach(async (e: any) => {
        let elem = await e as PageSection
        let el = elem.getBoundingClientRect()

        
        if (el.top <= upperHit && el.bottom >= lowerHit) {
          if (lastHit !== elem) {
            cb(elem)
            lastHit = elem
          }
        }
      })
    }
    this.customIntersectionObserver.set(obsElem, new EventListener(this, ["scroll", "resize"], f, this.active))
    f()
  }

  public removeIntersectionListener(obsElem: HTMLElement) {
    this.customIntersectionObserver.get(obsElem).deactivate()
    this.customIntersectionObserver.delete(obsElem)
  }

  private constructScrollTo(section: PageSection) {
    let sectionRootName: string
    sectionRootName = this.sectionIndex.getLoadedKeyOfResource(section)
    let whileWaitingQueue = []
    


    const go = async (verticalOffset: number, speed: number, force: boolean) => {
      if (this.inScrollAnimation.get() && !force) return

      let scrollAnimation: Symbol
      this.inScrollAnimation.set(scrollAnimation = Symbol())
      this.userInitedScrollEvent = false

      let al = this.sectionAliasList.getAllAliasesByRoot(sectionRootName)
      let sectionName = sectionRootName
      if (al instanceof ScrollProgressAliasIndex) {
        let toBeScrolledPosition = section.scrollTop + verticalOffset
        for (let e of al.scrollProgressAliases) {
          if (e.progress.get() <= toBeScrolledPosition) sectionName = e.aliases.get().first
          else break
        }
      }
      else sectionName = al.aliases.get().first

      this.activateSectionName(sectionName)


      if (this.currentlyActiveSectionElem) this.currentlyActiveSectionElem.deactivate()
      this.currentlyActiveSectionElem = section
      this.currentlyActiveSectionElem.activate()

      debugger

      await scrollTo(section.offsetTop, {
        cancelOnUserAction: true,
        verticalOffset,
        speed,
        elementToScroll: this,
        easing
      })

      
      

      if (scrollAnimation === this.inScrollAnimation.get()) {
        this.inScrollAnimation.set(undefined)
        this.userInitedScrollEvent = true
      }
    }

    


    return (to?: number, speed: number = scrollAnimationSpeed, force: boolean = false) => {
      return new Promise((res) => {
        let off = to !== undefined ? to : scrollToPadding
        let gogo = () => go(off, speed, force).then(res)
        if (sectionRootName === undefined) whileWaitingQueue.add(gogo)
        else gogo()
      }) as Promise<void>
    }
  }

  


  protected async activationCallback(active: boolean) {
    //@ts-ignore
    let sectionIndex: ResourcesMap = await this.sectionIndex


    if (active) {
      // let init = this.sectionAliasList.getRootOfAlias(this.domainSubscription.domain)
      // let sec = sectionIndex.get(init)
      // if (sec === undefined) return false
    
      // sec.priorityThen()
      // sec.then((e: PageSection) => {
      //   let verticalOffset = padding + e.offsetTop
      //   let ali = this.sectionAliasList.reverseIndex[this.domainSubscription.domain]
      //   if (ali) if (ali instanceof ScrollProgressAliasIndex.Reverse) verticalOffset += ali.progress - padding + .5
      //   this.componentBody.scrollBy(0, verticalOffset)
      // })
      if (this.currentlyActiveSectionElem) this.currentlyActiveSectionElem.activate()

      sectionIndex.forEach(async (elem: any) => {
        elem = await elem
        this.mainIntersectionObserver.observe(elem)
      })
    }
    else {
      this.intersectingIndex.clear()
      this.currentlyActiveSectionElem.deactivate()
      sectionIndex.forEach(async (elem: any) => {
        elem = await elem
        this.mainIntersectionObserver.unobserve(elem)
      })
    }
  }


  stl() {
    return super.stl() + require("./sectionedPage.css").toString()
  }
}
