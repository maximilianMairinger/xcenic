import Site from "./_component/site/site"

export default function() {
  let site = new Site()
  // site.style.left = "0"

  document.body.append(site)
}