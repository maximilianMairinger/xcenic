import { DataCollection } from "josm"
import * as fuzzySearch from "../../../../../../../lib/fuzzySearch.worker"
import { currentLanguage } from "../../../../../../../lib/lang"
import Select from "./select"


export default function(t: Select) {
  currentLanguage.get((lang) => {fuzzySearch.setLang(lang)})
  
  fuzzySearch.add("English")
  fuzzySearch.add("German")
  
  const autoCompleteElem = ce("input")
  autoCompleteElem.id = "autoComplete";
  (t as any).moveBody.insertBefore(autoCompleteElem as any, (t as any).inputElem as any)
  
  
  
  let results: Promise<string[]>

  const selModOp = t.selectMode.options
  t.textValue.get(async (value) => {
  
  
    results = fuzzySearch.search(value, 5, { suggest: true })
    const res = await results
    const firstResult = res.first

    if (selModOp.autoComplete.get()) {
      const match = firstResult && firstResult.toLowerCase().indexOf(value.toLowerCase());

      if (firstResult && (match !== -1)) {
        autoCompleteElem.value = value + firstResult.substring(match + value.length);
      }
      else {
        autoCompleteElem.value = ""
      }
    }

  
    
  
  }, t.isFocused.get())

  
  
  const confirm = async () => {
    if (t.selectMode.options.forceOption.get()) {
      if (results !== undefined) t.textValue.set((await results).first)
    }
    t.value.set(t.textValue.get())
  }
  
  t.on("keydown", (e) => {
    if (e.key === "Enter") confirm()
  })
  t.on("blur", () => {
    confirm()
  })

  return async function () {
    const tippy = (await import("tippy.js")).default;

    t.sra(ce("style").html(require("tippy.js/dist/tippy.css").toString() + require("./tippyModification.css").toString() + require('tippy.js/animations/shift-away-subtle.css').toString()))


    const tip = tippy((t as any).inputElem as HTMLElement, {
      content: "test <b>waosd</b>",
      allowHTML: true,
      trigger: "manual",
      placement: "top",
      animation: 'shift-away-subtle',
      appendTo: "parent",
      arrow: false,
      maxWidth: 400,
      
      popperOptions: {
        modifiers: [
          {
            name: 'flip',
            options: {
              padding: {top: 60, left: 5, right: 5, bottom: 5},
            },
          }
        ]
      }
    });

    (t as any).inputElem.on("focus", () => {
      tip.show()
    })

    // t.textValue.get(async () => {
    //   const res = await results


    // })
  }
}
