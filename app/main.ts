import Site from "./_component/site/site"

export default function() {
  let site = new Site() as any


  document.body.append(site)
}