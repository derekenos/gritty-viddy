
import Base from "./Base.js"
import {
  Element,
  getMaxZIndex,
} from "../lib/domHelpers.js"


const StyleFactory = vars => `
  button {
    background-color: rgba(64, 64, 64, .8);
    color: #fff;
    border: none;
    padding: 8px 14px;
    font-size: 1.2rem;
    cursor: pointer;
  }

  button:hover {
    background-color: rgba(100, 100, 100, .8);
    color: #fff;
  }

  .wrapper {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: ${vars.maxZIndex} + 1;
  }

  .content {
    display: inline-block;
    margin: auto;
    padding: 1rem;
    background-color: rgba(200, 200, 200, 0.8);
    border: solid #fff 1px;
  }

  .buttons-wrapper {
    text-align: right;
    padding-top: 2rem;
  }

  .buttons-wrapper > button {
    margin-right: .2rem;
  }

  .buttons-wrapper > button:last-child {
    margin-right: 0;
  }
`

export default class Modal extends Base {
  connectedCallback () {
    super.connectedCallback(
      StyleFactory({ maxZIndex: getMaxZIndex() })
    )

    const closeable = this.hasAttribute('cancelable')
    const confirmable = this.hasAttribute('confirmable')

    this.wrapper = Element(
      `<div class="wrapper">
         <div class="content">
           <slot name="content"></slot>
           <div class="buttons-wrapper"></div>
         </div>
       </div>
      `
    )

    const buttonsEl = this.wrapper.querySelector('.buttons-wrapper')

    if (closeable) {
      buttonsEl.appendChild(Element(
        `<button>Cancel</button>`
      ))
    }

    if (confirmable) {
      buttonsEl.appendChild(Element(
        `<button>Ok</button>`
      ))
    }

    this.shadow.appendChild(this.wrapper)
  }
}


customElements.define("mod-al", Modal)
