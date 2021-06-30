import Component from "../_component/component";

const byMe = Symbol()

/**
 * Declare new Component and append it to the customElementRegitry
 * @param name Name of the component, how it should be refelected in the dom (when not starting with "c-", "c-" will be prefixed) 
 * @param component The component class; observedAttributes will be injected automatically
 */
export function declareComponent<Comp>(name: string, component: Comp){
  //@ts-ignore
  const observedAttributes = component.observedAttributes
  if (!observedAttributes || observedAttributes[byMe]) {
    //Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(component).prototype))
    let attrbs = []
    attrbs[byMe] = true
    let cur = component
    //@ts-ignore
    while (cur.prototype instanceof Component) {
      //@ts-ignore
      let localAttrbs = Object.getOwnPropertyNames(cur.prototype)
      for (let i = 0; i < localAttrbs.length; i++) {
        if (!isLowerCase(localAttrbs[i])) {
          let lower = localAttrbs[i].toLowerCase()
          //@ts-ignore
          cur.prototype[lower] = cur.prototype[localAttrbs[i]]
          localAttrbs[i] = lower
        }
      }
      attrbs.add(...localAttrbs)
      cur = Object.getPrototypeOf(cur)
      
    }


    //@ts-ignore
    component.observedAttributes = attrbs.rmV("constructor", "stl", "pug")
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
