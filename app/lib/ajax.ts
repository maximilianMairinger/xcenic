import { parse, stringify } from "./serialize"


export async function get(url: string): Promise<object> {
  const req = await fetch(url)
  if (req.status !== 200) {
    throw new Error(`${req.status} ${req.statusText}`)
  }
  return parse(await req.text())
}

export async function post(url: string, data: object): Promise<object> {
  const req = (await fetch(url, {
    method: "POST",
    body: stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  }))
  if (req.status !== 200) {
    throw new Error(`${req.status} ${req.statusText}`)
  }
  return parse(await req.text())
}
