import Frame from "./../frame";
import LoadingIndecator from "../../../_indecator/loadingIndecator/loadingIndecator";
import * as domain from "../../../../lib/domain";
import lazyLoad, { ImportanceMap, Import, ResourcesMap, PriorityPromise } from "../../../../lib/lazyLoad";
import SectionedPage from "../_page/_sectionedPage/sectionedPage";
import delay from "delay";
import { Theme } from "../../../_themeAble/themeAble";
import PageSection from "../_pageSection/pageSection";
import { EventListener } from "extended-dom";
import Page from "../_page/page";

import HighlightAbleIcon from "../../_icon/_highlightAbleIcon/highlightAbleIcon";
import { Data } from "josm";



/** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function occurrences(string: string, subString: string, allowOverlapping = false) {

  string += "";
  subString += "";
  if (subString.length <= 0) return (string.length + 1);

  var n = 0,
      pos = 0,
      step = allowOverlapping ? 1 : subString.length;

  while (true) {
      pos = string.indexOf(subString, pos);
      if (pos >= 0) {
          ++n;
          pos += step;
      } else break;
  }
  return n;
}






export default abstract class Manager extends Frame {

  protected busySwaping: boolean = false;
  public currentPage: Page

  protected body: HTMLElement;

  private wantedFrame: Page;


  private loadingElem: any;




  private resourcesMap: ResourcesMap

  constructor(private importanceMap: ImportanceMap<() => Promise<any>, any>, public domainLevel: number, private pageChangeCallback?: (page: string, sectiones: {[link: string]: HighlightAbleIcon}[], domainLevel: number) => void, private pushDomainDefault: boolean = true, private onScroll?: (scrollProgress: number) => void, private onUserScroll?: (scrollProgress: number, userInited: boolean) => void, public blurCallback?: Function, public preserveFocus?: boolean) {
    super(null);

    this.body = ce("manager-body");
    this.loadingElem = new LoadingIndecator();
    
    this.body.apd(this.loadingElem)
    this.sra(this.body);

    this.on("keydown", (e) => {
      if (e.code === "Escape") {
        this.blur();
        if (this.blurCallback !== undefined) this.blurCallback(e);
      }
    });


    if (onUserScroll && onScroll) {
      this.scrollEventListener = new EventListener(this, "scroll", () => {
        //@ts-ignore
        let y = this.currentPage.scrollTop
        onUserScroll(y, this.currentPage.userInitedScrollEvent)
        onScroll(y)
      }, true, {passive: true})
    }
    else {
      if (onUserScroll) this.scrollEventListener = new EventListener(this, "scroll", () => {
        //@ts-ignore
        onUserScroll(this.currentPage.scrollTop, this.currentPage.userInitedScrollEvent)
      }, false, {passive: true})
      else if (onScroll) this.scrollEventListener = new EventListener(this, "scroll", () => {
        //@ts-ignore
        onScroll(this.currentPage.scrollTop)
      }, false, {passive: true})
    }

    const { resourcesMap } = lazyLoad(this.importanceMap, e => {
      this.body.apd(e)
    })
    this.resourcesMap = resourcesMap
    this.domainSubscription = domain.get(this.domainLevel, this.setDomain.bind(this), false, "")
  }
  private async setDomain(to: string) {
    let wanted = await this.setElem(to)
    domain.set(wanted.domain, wanted.level, false)
  }

  private scrollEventListener: EventListener
  private domainSubscription: domain.DomainSubscription
  private loadImages: Function
  async minimalContentPaint() {
    // this.doneRec = record.record()
    await this.setDomain(this.domainSubscription.domain)
    // this.loadImages = this.doneRec()
  }
  async fullContentPaint() {
    // this.loadImages = this.doneRec()
  }
  async completePaint() {
    // this.loadImages()
  }

  private lastScrollbarWidth: number


  private intersectionListenerIndex: Map<HTMLElement, {cb: (elem: Frame) => void, threshold?: number}> = new Map

  public addIntersectionListener(root: HTMLElement, cb: (elem: Frame) => void, threshold?: number) {
    this.intersectionListenerIndex.set(root, {cb, threshold})
    if (this.currentPage) {
      if (this.currentPage.addIntersectionListener) this.currentPage.addIntersectionListener(root, cb, threshold)
      else {
        cb(this.currentPage)
      }
    }
  }
  public removeIntersectionListener(root: HTMLElement) {
    this.intersectionListenerIndex.delete(root)
    if (this.currentPage) {
      if (this.currentPage.removeIntersectionListener) this.currentPage.removeIntersectionListener(root)
    }
  }

  public addThemeIntersectionListener(root: HTMLElement, cb: (theme: Data<Theme>) => void) {
    this.addIntersectionListener(root, (q) => {
      cb(q.theme)
    })
  }

  public removeThemeIntersectionListener(root: Frame) {
    this.removeIntersectionListener(root)
  }

  private async canSwap(to: Page, domainFragment: string): Promise<boolean> {
    return await to.tryNavigate(domainFragment)
  }
  /**
   * Swaps to given Frame
   * @param to frame to be swaped to
   */
  private async swapFrame(to: Page): Promise<void> {
    if (this.busySwaping) {
      console.warn("was busy, unable to execute pageswap")
      // maybe retry, or cancel ...
      return 
    }
    this.busySwaping = true;
    this.loadingElem.remove();

    this.wantedFrame = to;
    let from = this.currentPage;

    
    

    if (from === to) {
      //Focus even when it is already the active frame
      if (!this.preserveFocus) to.focus()
      to.navigate()
      this.busySwaping = false
      return
    }
    

    

    to.show();
    if (!this.preserveFocus) to.focus();
    
    if (from !== undefined) from.deactivate()
    if (this.active) {
      to.navigate()
      to.activate()
    }


  
    this.currentPage = to;


    
    this.scrollEventListener.target((to as any)).activate()

    if (this.onUserScroll && this.onScroll) {
      
      let y = (this.currentPage as any).scrollTop
      this.onUserScroll(y, this.currentPage.userInitedScrollEvent)
      this.onScroll(y)
    }
    else {

      if (this.onUserScroll) {
        this.onUserScroll((this.currentPage as any).scrollTop, this.currentPage.userInitedScrollEvent)
      }
      else if (this.onScroll) this.onScroll((this.currentPage as any).scrollTop)
    }

    if (from !== undefined) if (from.removeIntersectionListener) {
      this.intersectionListenerIndex.forEach((q, elem) => {
        from.removeIntersectionListener(elem)
      })
    }
    if (to.addIntersectionListener) {
      this.intersectionListenerIndex.forEach(({cb, threshold}, elem) => {
        to.addIntersectionListener(elem, cb, threshold)
      })
    }
    else {
      this.intersectionListenerIndex.forEach(({cb}) => {
        cb(to)
      })
    }

    let showAnim = from !== undefined ? to.anim([{zIndex: 100, opacity: 0, translateX: -5, scale: 1.005, offset: 0}, {opacity: 1, translateX: 0, scale: 1}], 400) : to.anim([{offset: 0, opacity: 0}, {opacity: 1}], 400);


    (async () => {
      if (from === undefined) {
        await showAnim
      }
      else {

        // let fromAnim = from.anim([{offset: 0, translateX: 0}, {translateX: 10}], 3000)
        await Promise.all([showAnim])
  
        from.css({opacity: 0, display: "none"})
  
      }
  
  
      to.css("zIndex", 0)
      this.busySwaping = false;
      if (this.wantedFrame !== to) {
        await this.swapFrame(this.wantedFrame);
        return
      }
    })()
  }

  private currentUrl: string
  private nextPageToken: Symbol

  public element(): string
  public element(to: string, push?: boolean): void
  public element(to?: string, push: boolean = this.pushDomainDefault) {
    if (to) domain.set(to, this.domainLevel, push)
    else return this.currentUrl
  }

  private async setElem(fullDomain: string) {
    let to: any = fullDomain
    let nextPageToken = Symbol("nextPageToken")
    this.nextPageToken = nextPageToken;

    let sucDomainFrag: string
    let sucPage: any
    let sucDomainLevel: any

    let accepted = false
    let pageProm = this.resourcesMap.get(to, 1)
    while(!accepted) {
      let nthTry = 1
      
      
      while(pageProm === undefined) {
        to = to.substr(0, to.lastIndexOf("/")) as any
        pageProm = this.resourcesMap.get(to, nthTry)
      }

      let domFrag = fullDomain.splice(0, to.length)
      if (domFrag.startsWith("/")) domFrag = domFrag.substring(1)
      const rootDomainFragment = domFrag
      let domainFragment: string
      const domainLevel = to === "" ? 0 : (occurrences(to, "/") + 1 + this.domainLevel)
      sucDomainLevel = domainLevel

      while(pageProm !== undefined) {
        nthTry++

        let suc: boolean = await pageProm.priorityThen(async (page: Page | SectionedPage) => {
          if (nextPageToken === this.nextPageToken) {
            sucPage = page
            page.domainLevel = domainLevel
            domainFragment = rootDomainFragment === "" ? page.defaultDomain : rootDomainFragment
            return await this.canSwap(page, domainFragment)
          }
          return false
        });
  
        if (suc) {
          sucDomainFrag = domainFragment
          accepted = true
          break
        }
        else {
          pageProm = this.resourcesMap.get(to, nthTry)
        }
      }
    }
    
    pageProm.priorityThen(() => {
      if (this.currentUrl !== to) {
        this.currentUrl = to;
        let page = this.currentPage;
        (async () => {
          if (this.pageChangeCallback) {
            try {
              if ((page as SectionedPage).sectionList) {
                (page as SectionedPage).sectionList.tunnel(e => e.filter(s => s !== "")).get((sectionListNested) => {
                  let ob = {} as any
                  for (let e of sectionListNested) {
                    let ic = (page as SectionedPage).iconIndex[e]
                    while (!ic) {
                      if (e === "") break
                      e = e.substr(0, e.lastIndexOf("/"))
                      ic = (page as SectionedPage).iconIndex[e]
                    }
                    ob[e] = ic
                  }
                  
                  this.pageChangeCallback(to, ob, page.domainLevel)
                })
              }
              else this.pageChangeCallback(to, [], page.domainLevel)
            }
            catch(e) {}
          }
        })()
      }
    }, true)

    this.swapFrame(sucPage)

    
    return {domain: sucDomainFrag, level: sucDomainLevel}
  }

  protected async activationCallback(active: boolean) {
    if (this.currentPage) if (this.currentPage.active !== active) this.currentPage.vate(active as any)
  }
  stl() {
    return super.stl() + require('./manager.css').toString();
  }
}