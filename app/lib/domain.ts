import decodeUri from "fast-decode-uri-component"
import * as global from "./../global"
import slugify from "slugify"
import getBaseUrl from "get-base-url";
import lang from "./../lib/lang"


const commonTitle = "TGM";
const commonTitleSeperator = " - "
const commonSubtileSeperator = " > "
const maxCharactersInTitle = 20
const toMuchSubtitlesTruncate = "..."
const argData = "internal";


const titleElement = document.querySelector("title")

const httpString = "http://"
const httpsString = "https://"
export const dirString = "/";
const domIndex = [] as string[];
export const domainIndex = domIndex as Readonly<typeof domIndex>


function getCurrentSubDomainPath() {
  return decodeUri(document.location.pathname) as string
}

function parselocalUrlToDomainIndex() {
  let currentDomain = getCurrentSubDomainPath()
  domIndex.set(getCurrentSubDomainPath().split(dirString))
  domIndex.remove("");

  let endDomain = !currentDomain.endsWith("/") ? currentDomain + dirString : currentDomain
  
  history.replaceState(argData, updateTitle(), document.location.origin + endDomain)
}
parselocalUrlToDomainIndex()


function renderSubtitle(myDomainIndex = domIndex) {
  return myDomainIndex.Replace((k) => {
    try {
      return lang.links[k].get()
    }
    catch (e) {
      return k
    }
    
  }).join(commonSubtileSeperator)
}

function updateTitle() {
  let title = commonTitle

  let originalSubtitle: string, subtitle: string
  originalSubtitle = subtitle = renderSubtitle()

  let myDomainIndex = domIndex.clone()
  let tooMuchToTitles = false
  while(subtitle.length > maxCharactersInTitle && myDomainIndex.length > 1) {
    myDomainIndex.rmI(0)
    subtitle = renderSubtitle(myDomainIndex)
    tooMuchToTitles = true
  }

  if (subtitle.length !== 0) title += commonTitleSeperator

  if (tooMuchToTitles) {
    title = title + toMuchSubtitlesTruncate + commonSubtileSeperator
  }


  
  titleElement.txt(title + subtitle)
  return title + originalSubtitle
}

export function parseDomainIndexToDomain(domainIndex: Readonly<string[]>) {
  return domainIndex.join(dirString)
}


export function parseDomainToDomainIndex(domainIndex: string[], domain: string, level: number) {

  let originalLength = domainIndex.length
  
  if (level < 0) {
    level = originalLength - level    
  }
  if (originalLength < level) {
    console.warn("Unexpected index: " + level + ". Replacing it with " + originalLength + ".")
    level = originalLength
  }

  let anyChange = false
  let subdomains = domain.split(dirString).replace(e => slugify(e))
  
  domainIndex.splice(level + subdomains.length)
  if (domainIndex.length !== originalLength) anyChange = true
  
  subdomains.ea((sub, i) => {
    if (sub === "") sub = undefined
    let ind = i + level
    if (domainIndex[ind] !== sub) {
      anyChange = true
      if (sub === undefined) domainIndex.rmI(ind)
      else domainIndex[ind] = sub
    }
  })
  return anyChange
}

let currentDomainSet: Promise<void>
let inDomainSet = false
export async function set(subdomain: string, level: number = 0, push: boolean = true, notify = push) {
  if (level < 0) level = domainIndex.length - level
  initialGet = false
  if (subdomain.startsWith("/")) subdomain = subdomain.splice(0, 1)
  else if (subdomain.startsWith("./")) console.warn("Please use the domain level to set relative domains")
  
  while (inDomainSet) {
    await currentDomainSet
  }
  

  let domainIndexRollback = domIndex.clone()

  let res: Function
  inDomainSet = true
  currentDomainSet = new Promise((r) => {
    res = r
  })

  let anyChange = parseDomainToDomainIndex(domIndex, subdomain, level)
  if (!anyChange) {
    inDomainSet = false
    res()
    return
  }



  let endDomain = dirString + parseDomainIndexToDomain(domIndex)
  if (!endDomain.endsWith(dirString)) endDomain += dirString

  
  if (notify) {
    let recall: any
    for (let keyValue of ls) {
      let r = await keyValue[1]()
      if (r) recall = r
    }
    
    if (recall) {
      let { domain, domainLevel } = recall
      if (parseDomainToDomainIndex(domIndex, domain, domainLevel)) {
        let endDomain = domIndex.join(dirString)

        domIndex.set(domainIndexRollback)
        set(endDomain, 0, true)
      }
      else {
        if (push) pushState(updateTitle(), endDomain)
        else replaceState(updateTitle(), endDomain)
      }
    }
    else {
      if (push) pushState(updateTitle(), endDomain)
      else replaceState(updateTitle(), endDomain)
    }
  }
  else {
    if (push) pushState(updateTitle, endDomain)
    else replaceState(updateTitle(), endDomain)
  }


  inDomainSet = false
  res()
  
}


function pushState(title: any, endDomain: any) {
  history.pushState(argData, title, document.location.origin + endDomain)
}
function replaceState(title: any, endDomain: any) {
  history.replaceState(argData, title, document.location.origin + endDomain)
}


export class DomainSubscription {
  constructor(private getDomain: () => DomainFragment, public readonly activate: () => void, public readonly deactivate: () => void) {

  }
  get domain(): DomainFragment {
    return this.getDomain()
  }
  public vate(to: boolean) {
    if (to) this.activate()
    else this.deactivate()
  }

}

let initialGet = true
type DomainFragment = string
export function get(domainLevel: number, subscription: (domainFragment: DomainFragment) => (boolean | Promise<void> | Promise<boolean> | void), onlyInterestedInLevel?: boolean, defaultDomain?: string): DomainSubscription
export function get(domainLevel: number, subscription: undefined | null, onlyInterestedInLevel?: boolean, defaultDomain?: string): DomainFragment
export function get(domainLevel: number, subscription?: undefined, onlyInterestedInLevel?: boolean, defaultDomain?: string): DomainFragment
export function get(domainLevel: number, subscription?: (domainFragment: DomainFragment) => (boolean |  Promise<void> | Promise<boolean> | void), onlyInterestedInLevel: boolean = false, defaultDomain = ""): DomainFragment | DomainSubscription {
  let calcCurrentDomain = (() => {
    let domLvl = domainLevel < 0 ? domIndex.length - domainLevel : domainLevel
    if (!onlyInterestedInLevel) {
      let myDomainIndex = domIndex.clone()
      for (let i = 0; i < domLvl; i++) {
        myDomainIndex.shift() 
      }
  
      let joined = parseDomainIndexToDomain(myDomainIndex)
      return joined === "" ? defaultDomain : joined
    }
    else {
      return domIndex[domLvl] === undefined ? defaultDomain : domIndex[domLvl]
    }
  })
  let currentDomain = calcCurrentDomain();
  (() => {
    if (!initialGet) return
    let joined = parseDomainIndexToDomain(domIndex)
    let domain = joined === "" ? defaultDomain : joined

    if (joined !== domain) {
      set(domain, domainLevel < 0 ? domIndex.length - domainLevel : domainLevel, false)
    }
  })()


  if (subscription) {
    let f = async () => {
      let domLvl = domainLevel < 0 ? domIndex.length - domainLevel : domainLevel
      if (!onlyInterestedInLevel) {
        let myDomainIndex = domIndex.clone()
        for (let i = 0; i < domLvl; i++) {
          myDomainIndex.shift() 
        }
        let joined = parseDomainIndexToDomain(myDomainIndex)
        let domain = joined === "" ? defaultDomain : joined
        await subscription(domain)
        if (joined !== domain) {
          return {domain, domLvl}
        }

      }
      else {
        let domain = domIndex[domLvl] === undefined ? defaultDomain : domIndex[domLvl]
        await subscription(domain)
        if (domIndex[domLvl] !== domain) {
          return {domain, domainLevel: domLvl}
        }

      }
      
      
    }


    ls.set(subscription, f)



    return new DomainSubscription(calcCurrentDomain, () => {
      ls.set(subscription, f)
    }, () => {
      ls.delete(subscription)
    })

  }
  else {
    return currentDomain
  }

  
  
  

  
}



let ls = new Map()
window.onpopstate = async function(e) {
  while(inDomainSet) {
    await currentDomainSet
  }


  let res: Function
  inDomainSet = true
  currentDomainSet = new Promise((r) => {
    res = r
  })



  parselocalUrlToDomainIndex()



  for (let keyValue of ls) {
    await keyValue[1]()
    
  }
  
  
  inDomainSet = false
  res()
}

//@ts-ignore
window.domain = {set, get, domainIndex}





export function linkMeta(link: string, domainLevel: number = 0) {
  let myDomainIndex = domIndex.clone()
  parseDomainToDomainIndex(myDomainIndex, link, domainLevel)
  let isOnOrigin = getBaseUrl(link) === getBaseUrl()
  let href: string
  if (isOnOrigin) href = dirString + parseDomainIndexToDomain(myDomainIndex)
  else {
    href = link.startsWith(httpsString) || link.startsWith(httpString) ? link : httpsString + link
  }
  if (!href.endsWith(dirString)) href += dirString

  return {
    link,
    isOnOrigin,
    href
  }
}
