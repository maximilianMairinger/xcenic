import { Data, DataCollection } from "josm"
import Fuse, { FuseResult } from "../../../../../../../lib/fuzzySearch.worker"

import Select from "./select"



export default function(t: Select) {
  const autoCompleteElem = ce("input")
  autoCompleteElem.id = "autoComplete";
  (t as any).moveBody.insertBefore(autoCompleteElem as any, (t as any).inputElem as any)
  



  let results: Promise<FuseResult<string>[]>
  const selModOp = t.selectMode.options
  new DataCollection(selModOp.autoComplete, t.possibleValues).get((autoComplete, possibleValues) => {
    if (autoComplete) {
      const fuse = new Fuse(possibleValues, {})
      
      t.textValue.get(async (value) => {
        results = fuse.search(value, { limit: 5 }) as any as Promise<FuseResult<string>[]>
        const resLs = await results
        console.log(resLs)

        const explicitMatch = resLs.find((res) => res.item.toLowerCase() === value.toLowerCase())
        if (explicitMatch !== undefined) {
          // todo: make this work
          autoCompleteElem.value = explicitMatch.item
        }
      }, t.isFocused.get())

    }
  })
  
  

  
  
  const confirm = async () => {
    if (t.selectMode.options.forceOption.get()) {
      if (results !== undefined) t.textValue.set((await results)[0].item)
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

    t.sra(ce("style").html(require("tippy.js/dist/tippy.css").toString() + require('tippy.js/animations/shift-away-subtle.css').toString() + require("./tippyModification.css").toString()))


    const tip = tippy((t as any).inputElem as HTMLElement, {
      content: "test <b>waosd</b>",
      allowHTML: true,
      trigger: "manual",
      placement: "bottom",
      animation: 'shift-away-subtle',
      appendTo: "parent",
      arrow: false,
      hideOnClick: false,
      
      // popperOptions: {
      //   modifiers: [
      //     {
      //       name: 'flip'
      //     }
      //   ]
      // }
    });


    const placement = new Data("bottom");
    const mutObserver = new MutationObserver((muts) => {
      for (const mut of muts) {
        placement.set((mut.target as HTMLElement).getAttribute("data-placement"))
      }
    });
    mutObserver.observe(tip.popper.childs(".tippy-box") as HTMLElement, {
      attributes: true,
      childList: false,
      subtree: false,
      attributeFilter: ["data-placement"]
    });

    (t as Select).isFocused.get((is) => {
      if (is) tip.show()
      else tip.hide()
    })

    const dirSidesIndex = {
      bottom: ["BottomLeft", "BottomRight"],
      top: ["TopLeft", "TopRight"],
      right: ["TopRight", "BottomRight"],
      left: ["TopLeft", "BottomLeft"]
    }

    const inverseDirIndex = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left"
    }

    new DataCollection(placement, (t as Select).isFocused as Data<boolean>).get(async (placement, isFocused) => {
      if (isFocused) {
        for (const dir of dirSidesIndex[placement]) {
          // @ts-ignore
          t.css("border" + dir + "Radius", 0)
        }
        for (const dir of dirSidesIndex[inverseDirIndex[placement]]) {
          // @ts-ignore
          t.css("border" + dir + "Radius", 20)
        }
      }
      else t.css("borderRadius", 20)
    })

    // t.userFeedbackMode.


    // t.textValue.get(async () => {
    //   const res = await results


    // })
  }
}
