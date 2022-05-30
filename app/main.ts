import Site from "./_component/site/site"
import networkDataBase from "./lib/networkDataBase"
import base64url from "base64url"

export default function() {
  let site = new Site()

  document.body.append(site)


  const dataBase = networkDataBase("lang")
  dataBase(console.log)
  // @ts-ignore
  window.dd = dataBase;

  (async () => {
    
  })()


  
}