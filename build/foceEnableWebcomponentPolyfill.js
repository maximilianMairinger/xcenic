// source https://github.com/webcomponents/polyfills/search?p=2&q=force
(() => {
  window.WebComponents = { 
    flags: {
      forceCustomElements: true,
    }
  };
  window.ShadyDOM = {
    force: true
  }
  window.customElements.forcePolyfill = true
  
  window.ShadyCSS = {shimshadow: true};
})();
// ----------------------------- injected -----------------------------
