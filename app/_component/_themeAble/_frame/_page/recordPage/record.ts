import { DataBase } from "josm"
import ResablePromise from "../../../../../lib/resablePromise"

const attributeFilter = ["class", "id"]

type ElementRecord = {
  attributes: {[key: string]: string},
  style: {[key: string]: string},
  children: Array<Record>
  tagName: string,
  isShadowHost: boolean,
}

type TextRecord = {
  text: string
}

type Record = ElementRecord | TextRecord

export default function record(root: HTMLElement) {
  const data = new DataBase({})

  



  function discoverNewElem(elem: HTMLElement | Text) {
    const isText = elem instanceof Text
    const newDataRegister = {} as Record

    const giveChildrenDataLs = []

    if (!isText) {
      const attributes = (newDataRegister as ElementRecord).attributes = {};
      const styles = (newDataRegister as ElementRecord).style = {};
      const children = (newDataRegister as ElementRecord).children = [];

      (newDataRegister as ElementRecord).tagName = elem.tagName
      const allAttrbNames = elem.getAttributeNames()
      const attrbNames = attributeFilter.filter((n) => allAttrbNames.includes(n))
  
      for (const n of attrbNames) {
        attributes[n] = elem.getAttribute(n)
      }


      const isShadowHost = (newDataRegister as ElementRecord).isShadowHost = !!elem.shadowRoot


      const childMap = new Map<HTMLElement | Text, any>()

      const childList = elem instanceof HTMLSlotElement ? elem.assignedNodes() : isShadowHost ? elem.shadowRoot.childNodes : elem.childNodes

      
      for (const child of childList) {
        if (child instanceof HTMLElement || child instanceof Text) {
          const { gimmieData, newDataRegister } = discoverNewElem(child)
          childMap.set(child, giveChildrenDataLs.length)
          giveChildrenDataLs.push(gimmieData);
          children.push(newDataRegister)
        }
      }



      for (const key of elem.style) {
        styles[key] = elem.style[key]
      }


      const proxy = new Proxy(elem.style, {
        get: function (target, prop) {
          return target[prop]
        },
        set: function (target, prop, value) {
          const r = target[prop] = value
          setTimeout(() => {
            const o = {}
            o[prop] = value
            data.then((data) => {
              data(o)
            })
          })
          return r
        }
      });
    
      Object.defineProperty(elem, "style", {value: proxy})

      const observer = new MutationObserver(async (mutationEvents) => {
        const attributes = {}
        const children = {}
        const giveDataFuncs = []

        for (const mutationEvent of mutationEvents) {
          if (mutationEvent.type === "attributes") {
            const attrbName = mutationEvent.attributeName
            attributes[attrbName] = elem.getAttribute(attrbName)
          }
          else if (mutationEvent.type === "childList") {
            for (const child of mutationEvent.addedNodes) {
              if (child instanceof HTMLElement || child instanceof Text) {
                const { gimmieData, newDataRegister } = discoverNewElem(child)
                const id = ((await data).children() as any[]).length
                childMap.set(child, id)
                children[id] = newDataRegister
                giveDataFuncs.add(() => gimmieData(awData.children[id]))
              }
            }
            
            for (const child of mutationEvent.removedNodes) {
              if (child instanceof HTMLElement || child instanceof Text) {
                const id = childMap.get(child)
                childMap.delete(child)
                if (id !== undefined) {
                  children[id] = undefined
                }
                else console.warn("id not found")
              }
            }
          }
        }
        const awData = await data
        awData({attributes, children})
        for (const giveData of giveDataFuncs) giveData()
      })
  
      
      observer.observe(elem, {
        childList: true,
        attributes: true,
        attributeFilter,
        characterData: false
      })
    }
    else {
      (newDataRegister as TextRecord).text = elem.textContent

      const observer = new MutationObserver((mutationEvents) => {
        console.log(mutationEvents)
      })

      observer.observe(elem, {
        childList: false,
        attributes: false,
        characterData: true
      })
     
    }
    
    

    




    


    let data: ResablePromise<DataBase<ElementRecord>> = new ResablePromise<DataBase<ElementRecord>>()

    return {
      newDataRegister,
      gimmieData: (dat) => {
        data.res(dat)

        for (let i = 0; i < giveChildrenDataLs.length; i++) {
          giveChildrenDataLs[i](dat.children[i])
        }
      },
    }
  }

  const { gimmieData, newDataRegister } = discoverNewElem(root)
  data(newDataRegister)
  gimmieData(data)




  


  return {
    data,
    // stop() {
    //   observer.disconnect()
    // }
  }
}

function recordElem(elem: HTMLElement) {

}
