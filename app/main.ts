import Site from "./_component/site/site"

export default function() {
  let site = new Site()

  let a: string = 2
  document.body.append(site)
}