
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
