
console.log("recording123")

// import OpenReplay from '@openreplay/tracker';
// //...

// debugger
// const tracker = new OpenReplay({
//   projectKey: "wk89kO0Z05MBz1fQZAsF",
//   __DISABLE_SECURE_MODE: true,
//   captureIFrames: true,
//   capturePerformance: true
// });
// tracker.start();

// var _protocol="https:"==document.location.protocol?" https://":" http://"
// //@ts-ignore
//     _site_hash_code = "e703d5c7b0237efd64efa963c6710789",_suid=21125, plerdyScript=document.createElement("script");
//     //@ts-ignore
//     plerdyScript.setAttribute("defer",""),plerdyScript.dataset.plerdyMainScript="plerdyMainScript",
//     //@ts-ignore
//     plerdyScript.src="https://a.plerdy.com/public/js/click/main.js?v="+Math.random();
//     var plerdyMainScript=document.querySelector("[data-plerdyMainScript='plerdyMainScript']");
//     plerdyMainScript&&plerdyMainScript.parentNode.removeChild(plerdyMainScript);
//     //@ts-ignore
//     try{document.body.appendChild(plerdyScript)}catch(t){console.log("unable add script tag")}


// console.log("rec")

// const targetNode = document.documentElement

// // Options for the observer (which mutations to observe)
// const config = { attributes: true, childList: true, subtree: true };

// // Callback function to execute when mutations are observed
// const callback = function(mutationsList) {
//   // Use traditional 'for loops' for IE 11
//   for(const mutation of mutationsList) {
//     if (mutation.type === 'childList') {
//       for (const addedNode of mutation.addedNodes) {
//         if (addedNode.shadowRoot) {
//           console.log("observe", addedNode)
//           observer.observe(addedNode.shadowRoot, config);
//         }
//       } 
//       console.log(mutation.addedNodes, mutation)
//     }
//   }
// };

// // Create an observer instance linked to the callback function
// const observer = new MutationObserver(callback);

// // Start observing the target node for configured mutations
// observer.observe(targetNode, config);

// // // Later, you can stop observing
// // observer.disconnect();