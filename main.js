
let fixture = `{
  "description": "bla-bla-bla",
  "entries": [
    { "title": "matklad",       "url": "https://matklad.github.io/feed.xml" },
    { "title": "thegreenplace", "url": "https://eli.thegreenplace.net/feeds/all.atom.xml" }
  ]
}`

function loadState() {
  let state = localStorage.getItem('state')
  if (!state) {
    return { url: undefined }
  }
  return JSON.parse(state)
}

function storeState(state) {
  state = JSON.stringify(state)
  localStorage.setItem('state', state)
}

async function fetchAndUpdate() {
  let state = loadState()
  let url = state.url
  if (url) {
    dom.sourceUrl.value = state.url
    let feeds = await (await fetch(url)).json()
    await update(feeds.entries)
  } else {
    dom.sourceUrl.value = "fill me"
  }
}

let parser = new RSSParser()
async function fetchFeed(url) {
  url = 'https://corsproxy.io/?' + encodeURIComponent(url);
  try {
    return { ok: await parser.parseURL(url) }
  } catch (err) {
    return { err }
  }
}

async function update(feeds) {
  let buf = ""
  for (let { title, url } of feeds) {
    let feed = await fetchFeed(url)
    buf += `<li>${dom.makeFeed(title, feed)}</li>\n`
  }

  dom.feedList.innerHTML = `<ul>${buf}</ul>`
}


let dom = {
  get feedList() { return document.getElementById("feed-list") },
  get sourceUrl() { return document.getElementById("source-url") },
  get sourceUrlButton() { return document.getElementById("source-url-button") },

  makeFeed(title, { ok, err }) {
    if (ok) {
      let items = ok.items.slice(0, 5)
      let buf = ""
      for (let item of items) {
        buf += `<li>${dom.makePost(item)}</li>\n`
      }
      return `<h2>${title}</h2> <ul>${buf}</ul>`
    } else {
      return `<h2>${title}</h2> failed to load: ${err}</ul>`
    }
  },

  makePost({ title, link }) {
    return `<a href="${link}">${title}</a>`
  },
}


function main() {
  dom.sourceUrlButton.onclick = () => {
    let url = dom.sourceUrl.value
    let state = loadState()
    state.url = url
    storeState(state)
    fetchAndUpdate()
  }

  fetchAndUpdate()
}
window.onload = main
