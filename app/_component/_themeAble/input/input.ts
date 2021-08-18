import ThemeAble from "../themeAble"
import { Data } from "josm";
import "../../../global"


type ChangeEvent = InputEvent

import ArrowIcon from "../_icon/arrow/arrow"
import declareComponent from "../../../lib/declareComponent";



type Type = "password" | "text" | "number" | "email" | "integer" | "integerSigned" | "numberSigned"

function constrStrictValidation(inputElem: { onInput: Function, offInput: Function, value: Function }) {
  const activeInstanceCount = new Data(0)
  const oneIsActive = activeInstanceCount.tunnel((count) => count !== 0)

  
  let lastActive: string
  const lastActiveF = () => {
    setTimeout(() => {
      lastActive = inputElem.value()
    })
  }
  oneIsActive.get((oneActive) => {
    if (oneActive) {
      lastActive = inputElem.value()
      inputElem.onInput(lastActiveF)
    }
    else inputElem.offInput(lastActiveF)
  }, false) 

  const allInstances: Data<boolean>[] = []
  const strictValidate = (regex: RegExp, initVal: boolean = false) => {
    
    const f = () => {
      if (!inputElem.value().match(regex)) inputElem.value(lastActive)
    }
    const active = new Data(initVal)
    active.get((active) => {
      if (active) {
        activeInstanceCount.set(activeInstanceCount.get() + 1)
        inputElem.onInput(f)
      }
      else {
        activeInstanceCount.set(activeInstanceCount.get() - 1)
        inputElem.offInput(f)
      }
    }, false)
    if (active.get()) {
      activeInstanceCount.set(activeInstanceCount.get() + 1)
      inputElem.onInput(f)
    }
    allInstances.add(active)
    return active
  }

  strictValidate.disableAll = function() {
    allInstances.Inner("set", [false])
  }
  
  return strictValidate
}


var emailValidationRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export type Value = string | number

export default class Input extends ThemeAble {
  private placeholderElem: HTMLElement;
  private input: HTMLInputElement = ce("input");
  private _type: Type
  private iconHolder = ce("icon-holder")
  private arrowIcon = new ArrowIcon()

  private lastResp: Promise<any>
  private lastVal: string

  private valueSilentDefault = false
  private currentlyInvalid: boolean

  private focusListener = []
  private blurListener = []


  private isUp: boolean = false;  
  private isFocused: boolean = false;

  private strictValidate = constrStrictValidation({
    onInput: this.onForceValidatorInput.bind(this),
    offInput: this.offForceValidatorInput.bind(this),
    value(v?) {
      if (v === undefined) return this.input.value
      else this.input.value = v
    }
  })


  private onlyNum = this.strictValidate(/^\+?[0-9]*\.?[0-9]*$/)
  private onlyInt = this.strictValidate(/^[0-9]*$/)
  private onlySignedNum = this.strictValidate(/^(\+|-)?[0-9]*\.?[0-9]*$/)
  private onlySignedInt = this.strictValidate(/^(\+|-)?[0-9]*$/)


  
  private inputListenersForceValidator = []
  private inputListeners: {
    force: ((value: Value, valid: Promise<boolean>, e?: InputEvent) => void)[],
    normal: ((value: Value, e?: InputEvent) => void)[]
  } = {
    force: [],
    normal: []
  }
  private changeListeners: {
    force: ((value: Value, valid: Promise<boolean>, e?: ChangeEvent) => void)[],
    normal: ((value: Value, e?: ChangeEvent) => void)[]
  } = {
    force: [],
    normal: []
  }


  constructor(_placeholder: string = "", __type: Type = "text", submitCallback?: (value: string | number, e: KeyboardEvent) => void, _value?: any, public customVerification?: (value?: string | number) => (boolean | string | void) | Promise<(boolean | string | void)>, intrusiveValidation: boolean = true, formHolder?: (set: string) => string | void) {
    super(false)
  
    let enterAlreadyPressed = false;
    const enabled = new Data(true);
    (() => {
      const navigationCodes = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]
  
      const disabledFunc = (e: KeyboardEvent) => {
        if (!navigationCodes.includes(e.code)) {
          e.preventDefault()
          e.stopPropagation()  
        }
      }
      
      enabled.get((enabled) => {
        if (enabled) {
          this.input.removeEventListener("keydown", disabledFunc)
          this.removeClass("disabled")
        }
        else {
          this.input.addEventListener("keydown", disabledFunc)
          this.addClass("disabled")
          enterAlreadyPressed = false
        }
      }, false)
      
      
    })();
  
    
  
  
    
   
  
    
    
  
  
    
    
  
  
    

  
  
  
  
    
    this.type(__type);
  
    this.input.spellcheck = false
  
    this.placeholderElem = ce("input-placeholder");
  
    this.placeholder(_placeholder);
    
    
  
    // ----- Validation start
  
    if (formHolder) {
      this.addInputListener((e) => {
        let q = formHolder(e as any)
        if (q !== undefined) this.value(q as any, true)
      }, true)
    }
  
  
  
  
    let mousedown = false
    this.input.on('mousedown', () => {
      mousedown = true
    });
  
  
    
    this.input.on("keydown", (e) => {
      if (e.key === "Enter" && submitCallback !== undefined && !enterAlreadyPressed && !this.currentlyInvalid) {
        enterAlreadyPressed = true;
        submitCallback(this.value(), e);
      }
    });
    this.input.on("keydown", (e: any) => {
      e.preventHotkey = "input";
    })
    this.input.on("keyup", ({key}) => {
      if (key === "Enter") {
        enterAlreadyPressed = false;
      }
    });
  
    
    this.input.on("focus", () => {
      this.focusListener.Call()
      this.isFocused = true;
  
  
      this.placeHolderUp()
  
  
  
      if (!mousedown) {
        if (this.input.value !== "") this.input.select()
      }
    });
    this.input.on("blur", () => {
      if (!this.isFocused) return
      this.blurListener.Call()
      this.isFocused = false;
      mousedown = false
      enterAlreadyPressed = false
      if (!this.rawValue()) this.placeHolderDown();
    });
  
  
    this.apd(this.placeholderElem as any)
    this.apd(this.input as any as HTMLElement)
  
    if (_value !== undefined) this.value(_value);
  
  
    const constrInputListenerCaller = (ls: {normal: any[], force: any[]}) => {
      return async (e) => {
        this.inputListenersForceValidator.Call()
  
        this.valueSilentDefault = true
        let resInvalidProm: any
        let invalidProm = new Promise<boolean | string>((r) => {
          resInvalidProm = r
        })
        let validProm = invalidProm.then((invalid) => !invalid)
  
        ls.force.Call(this.input.value, validProm)
        this.validate(this.value()).then(resInvalidProm)
        if (await validProm) ls.normal.Call(this.value(), e as any)
        
        if (intrusiveValidation) this.showInvalidation(await invalidProm)
         
        this.valueSilentDefault = false
      }
    }
  
  
    this.input.addEventListener("input", constrInputListenerCaller(this.inputListeners))
    this.input.addEventListener("change", constrInputListenerCaller(this.changeListeners))
  
    
    this.apd(this.iconHolder)
  }

  setActionButton(listener: Function, icon: HTMLElement = this.arrowIcon) {
    this.iconHolder.html("")
    this.iconHolder.apd(icon)
    this.iconHolder.on("mousedown", listener as any)
    this.iconHolder.on("mousedown", (e) => {
      e.preventDefault()
      e.stopPropagation()
    })

    this.addClass("action-active")
    return icon
  }

  removeActionButton() {
    this.removeClass("action-active")
  }

  select() {
    this.input.select()
  }

  focus() {
    this.input.focus()
  }
  blur() {
    this.input.blur()
  }


  onInnerFocus(f: (value: Value, e?: InputEvent) => void, force: boolean = false) {
    this.focusListener.add(f as any)
  }
  offInnerFocus(f: (value: Value, e?: InputEvent) => void, force: boolean = false) {
    this.focusListener.rmV(f as any)
  }

  onInnerBlur(f: (value: Value, e?: InputEvent) => void, force: boolean = false) {
    this.blurListener.add(f as any)
  }
  offInnerBlur(f: (value: Value, e?: InputEvent) => void, force: boolean = false) {
    this.blurListener.rmV(f as any)
  }

  
  
  addInputListener(f: (value: Value, e?: InputEvent) => void, force: boolean = false) {
    this.inputListeners[force ? "force" : "normal"].add(f as any)
  }
  removeInputListener(f: (value: Value, e?: InputEvent) => void, force: boolean = false) {
    this.inputListeners[force ? "force" : "normal"].rmV(f as any)
  }

  private onForceValidatorInput(f: (value: Value, e?: InputEvent) => void, force: boolean = false) {
    this.inputListenersForceValidator.add(f as any)
  }
  private offForceValidatorInput(f: (value: Value, e?: InputEvent) => void, force: boolean = false) {
    this.inputListenersForceValidator.rmV(f as any)
  }
  

  addChangeListener(f: (value: Value, e?: ChangeEvent) => void, force: boolean = false) {
    this.changeListeners[force ? "force" : "normal"].add(f as any)
  }
  removeChangeListener(f: (value: Value, e?: ChangeEvent) => void, force: boolean = false) {
    this.changeListeners[force ? "force" : "normal"].rmV(f as any)
  }


  placeholder(to?: string) {
    if (to !== undefined) this.placeholderElem.html(to)
    else return this.placeholderElem.txt()
  }

  type(to?: Type) {
    if (to !== undefined) {
      if (to === "number") {
        this.strictValidate.disableAll()
        this.onlyNum.set(true)
        this.input.type = to
      }
      else if (to === "numberSigned") {
        this.strictValidate.disableAll()
        this.onlySignedNum.set(true)
        this.input.type = to
      }
      else if (to === "integer") {
        this.strictValidate.disableAll()
        this.onlyInt.set(true)
        this.input.type = "number"
      }
      else if (to === "integerSigned") {
        this.strictValidate.disableAll()
        this.onlySignedInt.set(true)
        this.input.type = "number"
      }
      else {
        this.strictValidate.disableAll()
        if (to === "text") {
          this.input.setAttribute("type", "new-password")
        }
        else {
          this.input.type = to
        }
      }
      
      this._type = to;
    }
    else return this._type
  }

  async isValid(emptyAllowed: boolean = true) {
    let valid = !await this.validate();
    if (emptyAllowed) return valid;
    return !!this.rawValue() && valid;
  }

  
  
  value(to?: Value, silent = this.valueSilentDefault): any {
    if (to !== undefined) {
      return (async () => {
        this.input.value = to.toString();
        for (let f of this.inputListenersForceValidator) {
          f()
        }

        this.alignPlaceHolder();
    
        let resInvalidProm: Function
        let invalidProm = new Promise<boolean | string>((r) => {
          resInvalidProm = r
        })

        if (!silent) {
          let validProm = new Promise<boolean>((res) => {
            invalidProm.then((invalid) => {
              res(!invalid)
            })
          })
          this.inputListeners.force.Call(this.input.value, validProm)
          this.changeListeners.force.Call(this.input.value, validProm)
        }


        this.validate(this.input.value).then((e) => {
          resInvalidProm(e)
        })
  
      
      
        let invalid = await invalidProm
        
          
    
    
        
        this.showInvalidation(invalid)
        
          
    
  
        
    
        // onInput
        if (!silent) {
          if (!invalid) {
            this.inputListeners.normal.Call(this.value())
            this.changeListeners.normal.Call(this.value())
          }
        }
      })()
    }
    else {
      let v = this.input.value;
      if (this.input.type === "number") {
        return +v;
      }
      return v;
    }
  }

  // private lastResp: any
  // private lastVal: any
  private validate(val: any = this.value()): Promise<string | boolean | void> {
    if (this.lastVal === val) return this.lastResp
    this.lastVal = val
    this.lastResp = (async () => {
      let invalid: string | boolean | void = false
      if (this.type() === "number") invalid = isNaN(val) ? "Eine Zahl erwartet" : false;
      else if (this.type() === "email") invalid = emailValidationRegex.test((val).toLowerCase()) ? false : "Keine valide Email Adresse";
      if (this.customVerification !== undefined) {
        let returnInvalid = await this.customVerification(val)
        if (typeof returnInvalid === "boolean") {
          if (!returnInvalid) invalid = true
        }
        else if (typeof returnInvalid === "string") {
          if (returnInvalid) invalid = returnInvalid
        }
      }
      if (!val) invalid = false
      return invalid;
    })()

    return this.lastResp
  }
  private rawValue() {
    return this.input.value
  }
  private alignPlaceHolder() {
    if (!this.rawValue() && !this.isFocused) this.placeHolderDown();
    else this.placeHolderUp();
  }
  
  private placeHolderUp() {
    if (!this.isUp) {
      if (!this.matches(":first-child")) this.anim({marginTop: 15}, 400)
      
      this.placeholderElem.anim({transform: "translate(-6px, -" + (this.height() / 2 + 11) + "px)", fontSize: ".8em"}, 400);
      this.isUp = true;
      this.placeholderElem.css("cursor", "auto");
    }
  }
  private placeHolderDown() {
    if (this.isUp) {
      if (!this.matches(":first-child")) this.anim({marginTop: 0}, 400)
      this.placeholderElem.anim({transform: "translate(0, 0)", fontSize: "1em"}, 400);
      this.isUp = false;
      this.placeholderElem.css("cursor", "text");
    }
  }
  
  showInvalidation(valid: boolean | string | void = true) {
    if (valid) {
      this.addClass("invalid")
      if (valid === true) {
        // this.title = "Invalid input";
      }
      else if (typeof valid === "string") {
        this.title = valid
      }
    }
    else {
      this.title = "";
      this.removeClass("invalid")
    }

    //@ts-ignore
    this.currentlyInvalid = !!valid
  }


  pug() {
    return require("./input.pug").default
  }
  stl() {
    return require("./input.css").toString()
  }

}

declareComponent("input", Input)
