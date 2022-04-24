import featureRequirementsMet from "./featureDetection"



document.addEventListener("DOMContentLoaded", async () => {
  
  if (!featureRequirementsMet) {
    // rediect to nojs page by prefixing the url with /nojs
    window.location.href = "/nojs" + window.location.pathname + window.location.search + window.location.hash;
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

