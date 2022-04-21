const EventEmitter = require('events')
const puppeteer = require('puppeteer')
const { parse, parseMetaFromDocument } = require('parse-open-graph')
const URLRewriter = require('url-rewrite')
const fs = require('fs')
const path = require("path")
const axios = require("axios").default
const { JSDOM } = require("jsdom");
const delay = require('delay')

const emptyMediaFile = fs.readFileSync(path.join(__dirname, 'empty.wav'))
const cssNamespaceParsingCompiledJS = fs.readFileSync(path.join(__dirname, "cssNamespaceParsingCompiled.js")).toString()






class Prerenderer extends EventEmitter {
  constructor({
    debug = false,
    puppeteerLaunchOptions = undefined,
    timeout = 30000,
    userAgent = undefined,
    followRedirect = false,
    extraMeta = undefined,
    parseOpenGraphOptions = undefined,
    rewrites = undefined,
    omitDisplayNone = true,
    renderShadowRoot = false
  } = {}) {
    super()

    if (debug instanceof Function) {
      this.debug = debug
    } else if (debug === true) {
      this.debug = (...args) => {
        console.log(...args) // eslint-disable-line no-console
      }
    } else {
      this.debug = () => {}
    }

    this.puppeteerLaunchOptions = puppeteerLaunchOptions
    this.timeout = timeout
    this.userAgent = userAgent
    this.followRedirect = followRedirect
    this.extraMeta = extraMeta
    this.parseOpenGraphOptions = parseOpenGraphOptions
    this.browser = null
    this.rewrites = rewrites
    this.omitDisplayNone = omitDisplayNone
    this.renderShadowRoot = renderShadowRoot
    this._launchedAt = 0

    this._onBrowserDisconnected = this._onBrowserDisconnected.bind(this)
  }

  timer(name) {
    const time = Date.now()

    return () => {
      this.debug(`${name}: ${Date.now() - time}ms`)
    }
  }

  async launch(rdy) {
    if (this.browser) {
      // launch a new browser every hour
      if (this._launchedAt + 60 * 60 * 1000 > Date.now()) {
        return this.browser
      } else {
        const oldBrowser = this.browser
        oldBrowser.off('disconnected', this._onBrowserDisconnected)
        if (rdy === undefined) rdy = delay(this.timeout + 1000 * 60)
        rdy.then(() => oldBrowser.close())
        this._launch()
        return oldBrowser
      }
    } else {
      return this._launch()
    }
  }

  async _launch() {
    this._launchedAt = Date.now()
    this.debug('launch the browser with args:', this.puppeteerLaunchOptions)
    this.browser = await puppeteer.launch(this.puppeteerLaunchOptions)
    this.browser.on('disconnected', this._onBrowserDisconnected)

    return this.browser
  }

  _onBrowserDisconnected() {
    if (!this.closing) {
      this.browser = null
      // only emit 'disconnected' event when the browser is crashed
      this.emit('disconnected')
    }
  }

  // returns: { status, redirect, meta, openGraph, links, html, staticHTML }
  async render(url, {
    userAgent = this.userAgent,
    timeout = this.timeout,
    followRedirect = this.followRedirect,
    extraMeta = this.extraMeta,
    parseOpenGraphOptions = this.parseOpenGraphOptions,
    rewrites = this.rewrites
  } = {}) {
    let canClose
    const browser = await this.launch(new Promise((res) => {canClose = res}))
    const urlRewriter = rewrites && new URLRewriter(rewrites)
    const timerOpenTab = this.timer('open tab')
    const page = await browser.newPage()
    timerOpenTab()


    const result = {
      status: null,
      redirect: null,
      meta: null,
      openGraph: null,
      links: null,
      html: null,
      staticHTML: null
    }

    let navigated = 0

    const injectionScriptId = "kqwuznbdaszbteauzw"

    page.on('request', async req => {
      const resourceType = req.resourceType()
      let url = req.url()

      if (urlRewriter) {
        let urlRewrited

        try {
          urlRewrited = urlRewriter.from(url)
        } catch (e) {
          this.debug('url rewrite error.', url)
          return await req.abort()
        }

        if (!urlRewrited) {
          this.debug(url, 'rewrites to null.')
          return await req.abort()
        } else if (urlRewrited !== url) {
          this.debug(url, 'rewrites to', urlRewrited)
          url = urlRewrited
        }
      }

      if (req.isNavigationRequest()) {
        // abort iframe requests
        if (req.frame() !== page.mainFrame()) {
          this.debug('abort', url)
          return await req.abort()
        }

        navigated++

        if (navigated === 1 || followRedirect) {
          if (this.renderShadowRoot) {
            const {data: rawHTML} = await axios.get(url, {headers: {'User-Agent': this.userAgent}})

            const { document } = (new JSDOM(rawHTML)).window
            const head = document.querySelector("head")
            head.insertAdjacentHTML("afterbegin", `<script id=${JSON.stringify(injectionScriptId)}>${cssNamespaceParsingCompiledJS}</script>`)
            const parsedHTML = document.documentElement.outerHTML
  
            await req.respond({
              status: 200,
              contentType: "text/html",
              body: parsedHTML
            })
          }
          else {
            await req.continue({ url })
          }
         

        } else {
          await req.respond({
            status: 200,
            contentType: 'text/plain',
            body: 'redirect cancelled'
          })
        }
      } else if (['script', 'xhr', 'fetch'].includes(resourceType)) {
        this.debug(resourceType, url)
        await req.continue({ url })
      } else if (resourceType === 'stylesheet') {
        this.debug(resourceType, url)

        await req.respond({
          contentType: 'text/css',
          body: ''
        })
      } else if (resourceType === 'media') {
        this.debug(resourceType, url)

        await req.respond({
          contentType: 'audio/wav',
          body: emptyMediaFile
        })
      } else {
        this.debug('abort', resourceType, url)
        await req.continue({  })
      }
    })

    page.on('error', e => {
      this.debug('page crashed:', url, e)
    })

    try {
      const timerGotoURL = this.timer(`goto ${url}`)

      if (userAgent) {
        await page.setUserAgent(userAgent)
      }

      await page.setRequestInterception(true)

      const res = await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout
      })

      this.debug('networkidle0', url)

      const redirects = res.request().redirectChain()

      if (redirects.length) {
        result.status = redirects[0].response().status()
        result.redirect = redirects[0].response().headers().location

        if (!followRedirect) {
          return result
        }
      } else if (navigated > 1) { // redirect by js
        if (!followRedirect) {
          result.status = 302
          result.redirect = await page.url()

          return result
        }
      } else {
        result.status = res.status()
        const ok = result.status === 304 || res.ok()

        if (result.status === 304) {
          result.status = 200
        }

        if (!ok) {
          const text = await res.text()

          if (!text.length) {
            return result
          }
        }
      }

      timerGotoURL()


      const timerParseDoc = this.timer(`parse ${url}`)

      if (this.omitDisplayNone) {
        await page.evaluate(() => {
          
          const noneStr = "none"
          const whiteList = ["head", "style", "script", "meta", "link"].join(",")
          function removeInvisible(element) {
            if (getComputedStyle(element).display === noneStr) {
              if (!element.matches(whiteList)) element.remove()
            }
            else {
              let children = []
              children.push(...element.children)
              if (element.shadowRoot) children.push(...element.shadowRoot.children)
              for (let childElement of children) {
                removeInvisible(childElement)
              }
            }
            
          }
          removeInvisible(document.documentElement)
        })
      }

      if (this.renderShadowRoot) {
        await page.evaluate(() => {

          const cssIdMap = new Map()

          let wholeCss = []
          function styleScope(element, currentScope, goParseCss = true) {
      
            if (element instanceof HTMLStyleElement) {
              if (goParseCss) {
                const parsed = parseCssJHQWBDJASKJASDBJHS(element.innerHTML, "." + currentScope + "-scope", currentScope, true, {
                  replaceSelector: {
                    TypeSelector: {
                      slot: "slot-scoped"
                    }
                  }
                })
                element.remove()
                return parsed
              }
              else {
                element.remove()
                return
              }
              
              
            }
            else if (currentScope) element.classList.add(currentScope + "-scope")

            

            if (element instanceof HTMLElement && element.tagName.toLowerCase() === "slot-scoped") return
            
            const localCss = []

            const localChilds = [...element.children]
            

            // if (element.tagName.toLowerCase() === "c-block-button") console.log(localChilds.map((e) => e.tagName.toLowerCase()))
            // console.log(element.tagName.toLowerCase())
            
            if (element.shadowRoot) {
              const newTag = element.tagName.toLowerCase()
              // if (newTag === "c-block-button") console.log(localChilds.map((e) => e.tagName.toLowerCase()))
              const shadowChilds = [...element.shadowRoot.children]
              element.classList.add(newTag + "-scope")
              
              const mySlotElem = element.shadowRoot.querySelector("slot")
              if (mySlotElem) {
                const newSlot = document.createElement("slot-scoped")
                newSlot.classList.add(newTag + "-scope")
                const localTextNodesAndElements = [...element.childNodes].filter(x => x instanceof Text || x instanceof Element)
                newSlot.append(...localTextNodesAndElements)
                mySlotElem.parentNode.insertBefore(newSlot, mySlotElem.nextSibling);
                mySlotElem.remove()
              }
              element.shadowRoot.innerHTML = ""

              const goParseCssNew = !cssIdMap.has(newTag)
              if (goParseCssNew) cssIdMap.set(newTag, true)
              
              for (const child of shadowChilds) {

                element.append(child)
                

                
                
                
                const cssMaybe = styleScope(child, newTag, goParseCssNew)
                cssIdMap.set(newTag, true)
                if (cssMaybe) {
                  localCss.push(cssMaybe)
                }
              }

              for (const child of localChilds) {
                const cssMaybe = styleScope(child, currentScope, goParseCss)
                if (cssMaybe) {
                  localCss.push(cssMaybe)
                }
              }
            }
            else {
              for (const child of localChilds) {
                const cssMaybe = styleScope(child, currentScope, goParseCss)
                if (cssMaybe) {
                  localCss.push(cssMaybe)
                }
              }
            }

            let css = localCss.join("\n\n")
            wholeCss.unshift(css)


            
            
            
          }
          
          styleScope(document.body, "")
          let styleElem = document.createElement("style")
          styleElem.innerHTML = wholeCss.reverse().join("\n\n")
          document.head.append(styleElem)
          

        })

        await page.evaluate((injectionScriptId) => {
          const script = document.querySelector(`#${injectionScriptId}`)
          script.remove()
        }, [injectionScriptId])
      }


      

      

      // html
      
      


      result.html = await page.content()

      // open graph
      const openGraphMeta = await page.evaluate(parseMetaFromDocument)
      const openGraph = result.openGraph = openGraphMeta.length
        ? parse(openGraphMeta, parseOpenGraphOptions)
        : null

      // extract meta info from open graph
      const meta = result.meta = {}

      if (openGraph) {
        if (openGraph.og) {
          if (openGraph.og.title) {
            meta.title = openGraph.og.title
          }

          if (openGraph.og.description) {
            meta.description = openGraph.og.description
          }

          if (openGraph.og.image) {
            meta.image = openGraph.og.image[0].url
          }

          if (openGraph.og.url) {
            meta.canonicalURL = openGraph.og.url
          }
        }

        if (openGraph.article) {
          if (openGraph.article.tag) {
            meta.keywords = openGraph.article.tag
          }
        } else if (openGraph.video && openGraph.video.tag) {
          meta.keywords = openGraph.video.tag
        } else if (openGraph.book && openGraph.book.tag) {
          meta.keywords = openGraph.book.tag
        }
      }

      const metaAndLinks = await page.evaluate((meta, extraMeta) => {
        // staticHTML
        // remove <script> tags
        const scripts = document.getElementsByTagName('script')
        ;[...scripts].forEach(el => el.parentNode.removeChild(el))

        // remove on* attributes
        const snapshot = document.evaluate(
          '//*[@*[starts-with(name(), "on")]]',
          document,
          null,
          XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
          null
        )

        for (let i = 0; i < snapshot.snapshotLength; i++) {
          const el = snapshot.snapshotItem(i)
          const attrNames = el.getAttributeNames()

          attrNames.forEach(attr => {
            if (attr.startsWith('on')) {
              el.removeAttribute(attr)
            }
          })
        }

        // remove <a href="javascript:*">
        // and collect links
        let links = new Set()
        const linkEls = document.links

        for (const a of linkEls) {
          if (a.protocol === 'javascript:') {
            a.href = '#'
          } else {
            links.add(a.href)
          }
        }

        links = [...links]

        // remove conditional comments
        // no need to keep comments
        // so actually we can remove all comments
        const nodeIterator = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_COMMENT)
        let node

        while (node = nodeIterator.nextNode()) { // eslint-disable-line no-cond-assign
          node.parentNode.removeChild(node)
        }

        if (!meta.title && document.title) {
          meta.title = document.title
        }

        ['author', 'description'].forEach(name => {
          const el = document.querySelector(`meta[name="${name}"]`)

          if (el) {
            meta[name] = el.content
          }
        })

        ;['robots', 'keywords'].forEach(name => {
          const el = document.querySelector(`meta[name="${name}"]`)

          if (el) {
            meta[name] = el.content.split(/\s*,\s*/)
          }
        })

        const link = document.querySelector('link[rel="canonical"]')

        if (link) {
          meta.canonicalURL = link.href
        }

        const locales = document.querySelectorAll('link[rel="alternate"][hreflang]')

        if (locales.length) {
          meta.locales = []

          for (const alt of locales) {
            meta.locales.push({
              hreflang: alt.hreflang,
              href: alt.href
            })
          }
        }

        const media = document.querySelectorAll('link[rel="alternate"][media]')

        if (media.length) {
          meta.media = []

          for (const m of media) {
            meta.media.push({
              media: m.media,
              href: m.href
            })
          }
        }

        if (!meta.image) {
          const imgs = document.getElementsByTagName('img')

          for (const img of imgs) {
            if (img.width >= 200 && img.height >= 200) {
              meta.image = img.href
              break
            }
          }
        }

        if (extraMeta) {
          for (const name of Object.keys(extraMeta)) {
            const { selector, property } = extraMeta[name]
            const el = document.querySelector(selector)

            if (el) {
              meta[name] = el[property]
            }
          }
        }

        return {
          meta: Object.keys(meta).length ? meta : null,
          links: links.length ? links : null
        }
      }, meta, extraMeta)

      Object.assign(result, metaAndLinks)
      result.staticHTML = await page.content()
      timerParseDoc()

      return result
    } finally {
      try {
        await page.close()
        console.log("page closed")
      } catch (e) {
        // UnhandledPromiseRejectionWarning will be thrown if page.close() is called after browser.close()
      }
    }
  }

  async close() {
    if (this.browser) {
      this.closing = true
      await this.browser.close()

      console.log("browser close")

      this.browser = null
      this.closing = false
    }
  }
}

module.exports = Prerenderer
