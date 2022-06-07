import { parse, stringify } from "./serialize"


export async function get(url: string): Promise<object> {
  return parse(await (await fetch(url)).text())
}

export async function post(url: string, data: object): Promise<object> {
  return parse(await (await fetch(url, {
    method: "POST",
    body: stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })).text())
}
