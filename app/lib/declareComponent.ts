import Component from "../_component/component";


const alreadyDoneMap = new Map<any, boolean>()

const attrSetFunc = function (attrName: string, oldVal: string, newVal: string) {
  this[attrName](newVal)
}

/**
 * Declare new Component and append it to the customElementRegitry
 * @param name Name of the component, how it should be refelected in the dom (when not starting with "c-", "c-" will be prefixed) 
 * @param component The component class; observedAttributes will be injected automatically
 */
export function declareComponent<Comp>(name: string, component: Comp){
  //@ts-ignore
  const observedAttributes = component.observedAttributes
  if (!observedAttributes) {
    //Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(component).prototype))
    let attrbs = (component as any).observedAttributes = []
    let cur = component as any

    

    //@ts-ignore
    while (cur.prototype instanceof Component) {
      //@ts-ignore
      let localAttrbs = Object.getOwnPropertyNames(cur.prototype)
      
      for (let i = 0; i < localAttrbs.length; i++) {
        const nc = localAttrbs[i]
        const lc = nc.toLowerCase()
        if (!alreadyDoneMap.has(cur)) {
          const desc = Object.getOwnPropertyDescriptor((cur as any).prototype, nc)
          if (desc.value instanceof Function) {
            if (lc !== nc) {
              if (!localAttrbs.includes(lc)) {
                cur.prototype[lc] = cur.prototype[nc]
              }
              else console.error("Two function names only differ in case, which is not allowed: " + localAttrbs[i] + " and " + lc + " of:", cur)
            }
          } 
        }

        localAttrbs[i] = lc
      }


      attrbs.add(...localAttrbs);
      alreadyDoneMap.set(cur, true);
      (cur as any).prototype.attributeChangedCallback = attrSetFunc
      cur = Object.getPrototypeOf(cur)
    }

    


    //@ts-ignore
    attrbs.rmV("constructor", "stl", "pug")
  }

  if (!name.startsWith("c-")) name = "c-" + name
  //@ts-ignore
  window.customElements.define(name, component)

  return component as Comp
}

function isLowerCase(myString) { 
  return (myString == myString.toLowerCase()); 
} 

export default declareComponent
