
import Base from "./Base.js"
import { Element } from "../lib/domHelpers.js"
import { publish } from "../lib/pubSub.js"
import {
  FILTER_NAME_DISPLAYNAME_MAP,
  FILTER_NAME_PARAM_KEY_ARR_POS_MAP,
  TOPICS,
} from "../lib/constants.js"


const FILTER_PARAM_STYLE = maxContentRems => `
  .wrapper {
    display: inline-block;
    position: relative;
    background-color: rgba(64, 64, 64, .8);
    color: #fff;
    padding: calc(8px + 1rem) 14px 8px 14px;
  }

  textarea {
    background-color: transparent;
    border: none;
    color: #fff;
    font-size: 1rem;
    cursor: text;
    padding: 0;
    width: calc(${Math.max(maxContentRems, 5)}rem - 28px);
    height: 1rem;
  }

  label {
    position: absolute;
    font-size: .8rem;
    top: .2rem;
    font-weight: normal;
  }
`


export class FilterParam extends Base {
  connectedCallback () {
    const filterId = this.getAttribute("filterId")
    const name = this.getAttribute("name")
    const value = this.getAttribute("value")
    const maxContentRems = Math.floor(Math.max(name.length * .8, value.length * .8))

    super.connectedCallback(FILTER_PARAM_STYLE(maxContentRems))

    const el = Element(
      `<span class="wrapper">
         <label>${name}</label>
         <textarea name="${name}" filterId="${filterId}">${value}</textarea>
       </span>
      `
    )
    this.shadow.appendChild(el)

    // Select the textarea text on focus.
    el.querySelector("textarea").addEventListener("focus", e => {
      e.target.select()
    })

    this.shadow.addEventListener("input", this.paramValueChangeHandler)
    // Stop keypress propagation to prevent trigger shortcuts when
    // editing text fields.
    this.shadow.addEventListener("keydown", e => e.stopPropagation())
  }

  paramValueChangeHandler (e) {
    const param = e.target
    const filterId = parseInt(param.getAttribute("filterId"))
    const name = param.getAttribute("name")
    const value = param.value
    publish(TOPICS.PARAMS_UPDATE, [ filterId, name, value ])
  }

}


customElements.define("filter-param", FilterParam)


const FILTER_ROW_STYLE = `
  button,
  select,
  input {
    background-color: rgba(64, 64, 64, .8);
    color: #fff;
    border: none;
    padding: 8px 14px;
    font-size: 1.2rem;
    cursor: pointer;
    margin: .5rem 0;
  }

  /* Remove the <select> button.
     https://stackoverflow.com/a/20464860/2327940
   */
  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    text-indent: 1px;
    text-overflow: '';
  }

  button:hover {
    background-color: rgba(100, 100, 100, .8);
    color: #fff;
  }
`


export default class FilterRow extends Base {
  connectedCallback () {
    super.connectedCallback(FILTER_ROW_STYLE)

    const name = this.getAttribute("name")
    const filterId = this.getAttribute("filterId")

    const el = Element(
      `<li filterId="${filterId}">
         <button class="remove">x</button>
         <button class="move-up">&uarr;</button>
         <button class="move-down">&darr;</button>
         <select class="filter">
           ${Array.from(FILTER_NAME_DISPLAYNAME_MAP.entries()).map(
               ([ name, displayname ]) =>
                 `<option value="${name}">${displayname}</option>`
             ).join('\n')
           }
         </select>
         <span class="filter-params"></span>
       </li>
      `, "ol"
    )
    // Select the option that matches the name property.
    el.querySelector(`option[value="${name}"]`).selected = true

    // Read the params from dataset and add the filter-param elements.
    const filterParams = el.querySelector(".filter-params")
    for (let paramName of FILTER_NAME_PARAM_KEY_ARR_POS_MAP.get(name)) {
      filterParams.appendChild(Element(
        `<filter-param filterId="${filterId}" name="${paramName}"
                       value="${this.dataset[paramName]}">
         </filter-param>
        `
      ))
    }
    this.shadow.appendChild(el)

    // Register the click handler.
    this.shadow.addEventListener("click", this.buttonHandler)

    // Publish filter select element changes.
    el.querySelector("select.filter").addEventListener("change", e => {
      const target = e.target
      const filterId = parseInt(target.parentElement.getAttribute("filterId"))
      publish(TOPICS.FILTER_CHANGE, [ filterId, target.value ])
    })
  }

  buttonHandler (e) {
    const target = e.target
    if (target.tagName !== "BUTTON") {
      return
    }
    const filterId = parseInt(target.parentElement.getAttribute("filterId"))
    let topic
    if (target.classList.contains("remove")) {
      topic = TOPICS.REMOVE_FILTER
    } else if (target.classList.contains("move-up")) {
      topic = TOPICS.MOVE_FILTER_UP
    } else if (target.classList.contains("move-down")) {
      topic = TOPICS.MOVE_FILTER_DOWN
    }
    publish(topic, filterId)
  }
}


customElements.define("filter-row", FilterRow)
