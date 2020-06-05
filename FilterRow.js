
import Base from "./Base.js"
import { FILTER_NAME_PARAM_KEY_ARR_POS_MAP } from "./ImageProcessor.js"
import { TOPICS, publish } from "./pubSub.js"
import { Element } from "./lib/domHelpers.js"


const FILTER_PARAM_STYLE = maxContentRems => `
  .wrapper {
    display: inline-block;
    position: relative;
    background-color: rgba(64, 64, 64, .8);
    color: #fff;
    padding: calc(8px + 1rem) 14px 8px 14px;
  }

  input {
    background-color: transparent;
    border: none;
    color: #fff;
    font-size: 1.2rem;
    cursor: text;
    padding: 0;
    width: calc(${maxContentRems}rem - 28px);
    text-align: center;
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
    const filterIdx = this.getAttribute("filterIdx")
    const name = this.getAttribute("name")
    const value = this.getAttribute("value")
    const maxContentRems = Math.floor(Math.max(name.length * .8, value.length * 1.2))

    super.connectedCallback(FILTER_PARAM_STYLE(maxContentRems))

    const el = Element(
      `<span class="wrapper">
         <label>${name}</label>
         <input type="text" value="${value}" name="${name}" filterIdx="${filterIdx}">
       </span>
      `
    )
    this.shadow.appendChild(el)

    this.shadow.addEventListener("input", this.paramValueChangeHandler)
  }

  paramValueChangeHandler (e) {
    const param = e.target
    const filterIdx = param.getAttribute("filterIdx")
    const name = param.getAttribute("name")
    const value = param.value
    publish(TOPICS.PARAMS_UPDATE, [ filterIdx, name, value ])
  }

}


customElements.define("filter-param", FilterParam)


const FILTER_ROW_STYLE = `
  button,
  input,
  select {
    background-color: rgba(64, 64, 64, .8);
    color: #fff;
    border: none;
    padding: 8px 14px;
    font-size: 1.2rem;
    cursor: pointer;
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
    const idx = this.getAttribute("idx")

    const el = Element(
      `<li>
         <button class="remove">x</button>
         <button class="move-up">&uarr;</button>
         <button class="move-down">&darr;</button>
         <select class="filter">
           <option value="threshold">Threshold</option>
           <option value="brightness">Brightness</option>
           <option value="channel">Channel</option>
           <option value="colorGain">Color Gain</option>
           <option value="colorReducer">Color Reducer</option>
           <option value="rowBlanker">Row Blanker</option>
           <option value="colBlanker">Column Blanker</option>
           <option value="invert">Invert</option>
           <option value="audioPlot">Audio Plot</option>
           <option value="flipHorizontal">Flip Horizontal</option>
           <option value="verticalMirror">Vertical Mirror</option>
           <option value="horizontalMirror">Horizontal Mirror</option>
         </select>
         <span class="filter-params"></span>
       </li>
      `, "ol"
    )
    // Select the option that matches the name property.
    el.querySelector(`option[value="${name}"]`).selected = true

    // Read the params from dataset.
    const filterParams = el.querySelector(".filter-params")
    for (let paramName of FILTER_NAME_PARAM_KEY_ARR_POS_MAP.get(name)) {
      filterParams.appendChild(Element(
        `<filter-param filterIdx="${idx}" name="${paramName}"
                       value="${this.dataset[paramName]}">
         </filter-param>
        `
      ))
    }
    this.shadow.appendChild(el)
  }
}


customElements.define("filter-row", FilterRow)
