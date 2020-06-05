
export function Element (tagNameOrDOMString, wrapperTag = "div") {
  // Return a new Element for a given tag name or DOM string.
  const s = tagNameOrDOMString.trim()
  if (!s.startsWith("<")) {
    return document.createElement(s)
  }
  const wrapper = document.createElement(wrapperTag)
  wrapper.innerHTML = s.trim()
  const el = wrapper.firstChild
  if (el.nodeName === "#text") {
    throw new Error(
      `Element creation failed. Maybe ${wrapperTag} is not a valid parent for: ${s}`
    )
  }
  wrapper.removeChild(el)
  return el
}


export function getMaxZIndex () {
  // Adapted from: https://dash.cloudflare.com/apps/developer/docs/techniques/styles#z-indexes
  let max = 0
  const elements = document.getElementsByTagName("*")
  Array.prototype.slice.call(elements).forEach(element => {
    const zIndex = parseInt(
      document.defaultView.getComputedStyle(element).zIndex,
      10
    )
    max = zIndex ? Math.max(max, zIndex) : max
  })
  return max
}
