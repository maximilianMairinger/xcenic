import featureRequirementsMet from "./featureDetection"



document.addEventListener("DOMContentLoaded", async () => {
  // TODO: Extra error msg
  if (!featureRequirementsMet) {
    
    return
  };

  document.body.innerHTML = ""

  await (await import(/* webpackChunkName: "init" */"./init")).init()
});


function getActiveElement(root: Document | ShadowRoot = document): Element | null {
  const activeEl = root.activeElement;

  if (!activeEl) {
    return null;
  }

  if (activeEl.shadowRoot) {
    return getActiveElement(activeEl.shadowRoot);
  } else {
    return activeEl;
  }
}

// setInterval(() => {
//   console.log(getActiveElement())
// }, 2000)

