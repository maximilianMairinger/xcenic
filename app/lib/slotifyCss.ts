import * as CssParser from "css-simple-parser";


export function slotifyCss(cssSource: string) {
  const joinRegex = /\ |>|~|\+/;
  const groupingSelectorString = ","
  const hostString = ":host"
  const slottedOpenString = "::slotted("
  const slottedCloseString = ")"

  
  const ast = CssParser.parse(cssSource);
  CssParser.traverse(ast, (node) => {
    if (node.selector.startsWith("@")) return

    const selectors = node.selector.trim().split(groupingSelectorString);
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i]
      debugger
      const host = selector.startsWith(hostString)
      if (host) {
        const match = (joinRegex.exec(selector) || {index: selector.length}).index + 1
        const subHost = selector.slice(match)
        if (subHost !== "") selectors[i] = selector.slice(0, match) + slottedOpenString + subHost + slottedCloseString
      }
      else {
        selectors[i] = slottedOpenString + selector + slottedCloseString
      }
    }
    node.selector = selectors.join(groupingSelectorString)
  });
  return CssParser.stringify(ast)
}

export default slotifyCss


