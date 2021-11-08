// (function(h,o,t,j,a,r){
//   //@ts-ignore
//   h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
//   //@ts-ignore
//   h._hjSettings={hjid:2669136,hjsv:6};
//   //@ts-ignore
//   a=o.getElementsByTagName('head')[0];
//   //@ts-ignore
//   r=o.createElement('script');r.async=1;
//   //@ts-ignore
//   r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
//   //@ts-ignore
//   a.appendChild(r);
// })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

// import logrocket from 'logrocket';
// logrocket.init('kvem5g/test');

import { record } from "rrweb"


export const recording = []
export const stopRecording = record({
  emit: (e) => {
    try {
      //@ts-ignore
      e.data.adds.forEach(add => {
        // if (add.node.tagName === "my-name") debugger
        if (add.parentId === 29) debugger
      })

    }
    catch (e) {
    
    }

    recording.add(e)
  }
})
