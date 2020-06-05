
import Base from "./Base.js"
import FilterRow from "./FilterRow.js"
import { Element } from "./lib/domHelpers.js"
import {
  TOPICS,
  FILTER_PRESET_NAMES,
  FILTER_PRESETS,
  FILTER_NAME_PARAM_DEFAULT_MAP
} from "./lib/constants.js"
import { getFilterById } from "./lib/utils.js"
import { subscribe, publish } from "./pubSub.js"


const STYLE = `
  button,
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

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .wrapper {
    display: flex;
  }

  .wrapper > * {
    margin: 0 4px;
  }

  .wrapper > div {
    display: inline-block;
  }

  .wrapper > div:first-child {
    flex-grow: 1;
    margin-left: 0;
  }

  .wrapper > div:last-child {
    margin-right: 0;
  }

  .filters {
  }

  .filters > div {
    margin-top: 1rem;
    margin-left: 1rem;
    opacity: 0;
    transition: opacity .25s;
  }

  .filters > div.visible {
    opacity: 1;
  }

  .record.recording,
  .record.recording:hover {
    background-color: rgba(255, 0, 0, 1);
    color: #fff;
  }
`


export default class Controls extends Base {
  constructor () {
    super()
    this.filters = []
  }

  connectedCallback () {
    super.connectedCallback(STYLE)

    this.wrapper = Element(
      `<div class="wrapper">
         <div class="filters">
           <button>Hide Filters</button>
           <div class="visible">
             <select class="filter-preset">
               <option value="">Preset: none</option>
               ${ FILTER_PRESET_NAMES.map((k, i) =>
                    `<option value="${k}"${i === 0 ? " selected" : ""}>Preset: ${k}</option>`
                  ).join('\n') }
             </select>
             <ol></ol>
             <button class="add-filter">Add Filter</button>
           </div>
         </div>
         <div><button class="record">Record</button></div>
         <div><button class="fullscreen">&#8644;</button></div>
       </div>
      `
    )
    this.shadow.appendChild(this.wrapper)

    // Define the Filters button click handler.
    this.wrapper.querySelector(".filters > button").addEventListener("click", e => {
      const filtersDiv = this.wrapper.querySelector(".filters > div")
      filtersDiv.classList.toggle("visible")
      e.target.innerText = `${filtersDiv.classList.contains("visible") ? "Hide" : "Show"} Filters`
    })

    // Define the button click handlers.
    this.wrapper.querySelector(".fullscreen")
      .addEventListener("click", () => publish(TOPICS.FULLSCREEN_TOGGLE))

    // Allow fullscreen to be controlled by the "f" key.
    window.addEventListener("keydown", e => {
      if (e.key === "f") {
        publish(TOPICS.FULLSCREEN_TOGGLE)
      }
    })

    // Define a preset change handler.
    const filterPreset = this.wrapper.querySelector(".filter-preset")
    filterPreset.addEventListener("change", e => {
      const presetName = e.target.value
      publish(TOPICS.PRESET_CHANGE, presetName)
      if (presetName) {
        this.filters = FILTER_PRESETS.get(presetName)
        this.renderFilters()
      }
    })

    // Render the default preset.
    this.filters = FILTER_PRESETS.get(filterPreset.value)
    this.renderFilters()

    this.wrapper.querySelector(".add-filter")
      .addEventListener("click", this.addFilter.bind(this))

    subscribe(TOPICS.FILTER_CHANGE, this.filterChangeHandler.bind(this))
    subscribe(TOPICS.PARAMS_UPDATE, this.paramValueUpdateHandler.bind(this))
    subscribe(TOPICS.REMOVE_FILTER, this.removeFilterHandler.bind(this))
    subscribe(TOPICS.MOVE_FILTER_UP, this.moveFilterUpHandler.bind(this))
    subscribe(TOPICS.MOVE_FILTER_DOWN, this.moveFilterDownHandler.bind(this))
  }

  addFilter () {
    // Find the current max filterId.
    const maxId = this.filters.reduce((maxId, [ id ]) => Math.max(maxId, id), -1)
    const filter = [ maxId + 1, "brightness", { factor: 1 } ]
    publish(TOPICS.ADD_FILTER, filter)
    this.filters.push(filter)
    this.renderFilters()
  }

  renderFilters () {
    // (re)Render the filters list.
    const filtersEl = this.wrapper.querySelector("ol")
    // Remove all existing filter rows.
    Array.from(filtersEl.children).forEach(x => x.remove())
    // Add all the current rows.
    this.filters.forEach(([ filterId, filterName, filterParams ]) => {
      const filterRow = Element(
        `<filter-row name="${filterName}" filterId="${filterId}"></filter-row>`
      )
      for (let [k, v] of Object.entries(filterParams)) {
        filterRow.dataset[k] = v
      }
      filtersEl.appendChild(filterRow)
    })
  }

  filterChangeHandler ([ filterId, newFilterName ]) {
    const [ filter, i ] = getFilterById(this.filters, filterId)
    const [ ,, params ] = this.filters[i]
    this.filters[i][1] = newFilterName
    // Set the default params.
    this.filters[i][2] = FILTER_NAME_PARAM_DEFAULT_MAP.get(newFilterName)
    // Clear preset selection.
    this.shadow.querySelector("select.filter-preset").value = ""
    this.renderFilters()
  }

  paramValueUpdateHandler ([ filterId, name, value ]) {
    // Update the local filter param and publish the new filters.
    const [ filter ] = getFilterById(this.filters, filterId)
    if (!filter) {
      return
    }
    const [ ,, params ] = filter
    params[name] = value
    // Clear preset selection.
    this.shadow.querySelector("select.filter-preset").value = ""
  }

  removeFilterHandler (filterId) {
    const [ filter, i ] = getFilterById(this.filters, filterId)
    if (filter) {
      this.filters.splice(i, 1)
      this.renderFilters()
    }
    // Clear preset selection.
    this.shadow.querySelector("select.filter-preset").value = ""
  }

  moveFilterUpHandler (filterId) {
    const [ filter, i ] = getFilterById(this.filters, filterId)
    if (i > 0) {
      this.filters.splice(i, 1)
      this.filters.splice(i - 1, 0, filter)
      this.renderFilters()
    }
    // Clear preset selection.
    this.shadow.querySelector("select.filter-preset").value = ""
  }

  moveFilterDownHandler (filterId) {
    const [ filter, i ] = getFilterById(this.filters, filterId)
    if (i < this.filters.length - 1) {
      this.filters.splice(i, 1)
      this.filters.splice(i + 1, 0, filter)
      this.renderFilters()
    }
    // Clear preset selection.
    this.shadow.querySelector("select.filter-preset").value = ""
  }
}


customElements.define("con-trols", Controls)
