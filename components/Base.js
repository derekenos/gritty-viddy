/*
   Subclass of HTMLElement that attaches a shadow root and style element.
 */

export default class Base extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: "open" })
  }

  connectedCallback (STYLE = "") {
    const style = document.createElement("style")
    style.textContent = STYLE
    this.shadow.appendChild(style)
  }
}
