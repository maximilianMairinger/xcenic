import SectionedPage, { QuerySelector, AliasList, scrollToPadding } from "../sectionedPage";
import lazyLoad, { ImportanceMap, ResourcesMap } from "../../../../../../lib/lazyLoad";
import LoadingIndecator from "../../../../../_indecator/loadingIndecator/loadingIndecator";
import * as domain from "../../../../../../lib/domain";
import constructAttachToPrototype from "attatch-to-prototype";

export default abstract class LazySectionedPage extends SectionedPage {

  private resourceMap: ResourcesMap

  private loadingIndecatorBot: HTMLElement
  private loadingIndecatorTop: HTMLElement
  private importanceMap: ImportanceMap<any, any>

  constructor(sectionIndex: ImportanceMap<() => Promise<any>, any>, baselink: string, sectionChangeCallback?: (section: string) => void, sectionAliasList?: AliasList, mergeIndex?: {[part in string]: string}) {
    const { resourcesMap, importanceMap } = lazyLoad(sectionIndex, (e, ind) => {
      let priorElem: HTMLElement
      let i = ind
      do {
        i--
        priorElem = loadedElementsIndex[i]
      } while (priorElem === undefined)


      this.componentBody.insertAfter(e, priorElem)
      loadedElementsIndex[ind] = e
      this.newSectionArrived(e, ind)
    })
    super(resourcesMap, baselink, sectionChangeCallback, sectionAliasList, mergeIndex)


    
    this.componentBody.apd(this.loadingIndecatorTop = ce("loading-indecator"))
    this.componentBody.apd(this.loadingIndecatorBot = ce("loading-indecator"))

    
    const loadedElementsIndex = {"-1": this.loadingIndecatorTop}
    loadedElementsIndex[sectionIndex.size] = this.loadingIndecatorBot
    const attach = constructAttachToPrototype(loadedElementsIndex)
    if (sectionIndex.size > 1) {
      //@ts-ignore
      attach("0", {set: (e) => {
            
        this.loadingIndecatorTop.remove()
        attach("0", {value: e})
      }})
      

      const lastIndex = (sectionIndex.size - 1) + ""
      //@ts-ignore
      attach(lastIndex, {set: (e) => {
        
        this.loadingIndecatorBot.remove()
        attach(lastIndex, {value: e})
      }})
      
    }
    else {
      //@ts-ignore
      attach("0", {set: (e) => {
            
        this.loadingIndecatorTop.remove()
        this.loadingIndecatorBot.remove()
        attach("0", {value: e})
        
      }})
    }

    
    
    
    
    resourcesMap.fullyLoaded.then(() => {
      this.loadingIndecatorBot.remove()
    })

    this.importanceMap = importanceMap
    this.resourceMap = resourcesMap
  }
  
  async minimalContentPaint() {
    const e = await this.resourceMap.get(this.currentDomainFragment).priorityThen()
  }
  


  async fullContentPaint() {
    await this.importanceMap.whiteListAll()
    await this.resourceMap.fullyLoaded  
  }

  async completePaint() {
    await this.importanceMap.whiteListAll("completePaint")
  }

  

  stl() {
    return super.stl() + require("./lazySectionedPage.css").toString()
  }
}
