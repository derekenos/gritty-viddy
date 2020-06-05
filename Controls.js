
import Base from "./Base.js"
import FilterRow from "./FilterRow.js"
import { Element } from "./lib/domHelpers.js"
import { TOPICS, subscribe, publish } from "./pubSub.js"


const STYLE = `
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

  .wrapper > span:first-child {
    flex-grow: 1;
    margin-left: 0;
  }

  .wrapper > span:last-child {
    margin-right: 0;
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
         <span class="filters">
           <button>Filters</button>
           <ol></ol>
         </span>
         <span><button class="record">Record</button></span>
         <span><button class="fullscreen">&#8644;</button></span>
       </div>
      `
    )
    // Register the button click handlers.
    this.wrapper.querySelector(".fullscreen")
      .addEventListener("click", () => publish(TOPICS.FULLSCREEN_TOGGLE))
    this.shadow.appendChild(this.wrapper)

    // Allow fullscreen to be controlled by the "f" key.
    window.addEventListener("keydown", e => {
      if (e.key === "f") {
        publish(TOPICS.FULLSCREEN_TOGGLE)
      }
    })

    subscribe(TOPICS.REMOVE_FILTER, this.removeFilter.bind(this))
    subscribe(TOPICS.MOVE_FILTER_UP, this.moveFilterUp.bind(this))
    subscribe(TOPICS.MOVE_FILTER_DOWN, this.moveFilterDown.bind(this))
    subscribe(TOPICS.FILTERS_UPDATED, this.filtersUpdatedHandler.bind(this))
  }

  renderFilters () {
    // (re)Render the filters list.
    const filtersEl = this.wrapper.querySelector(".filters > ol")
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

  filtersUpdatedHandler (filters) {
    this.filters = filters
    this.renderFilters()
  }

  removeFilter (idx) {
    this.filters.splice(parseInt(idx), 1)
    this.renderFilters()
  }

  moveFilterUp (idx) {
    console.log(`move ${idx} up`)
  }

  moveFilterDown (idx) {
    console.log(`move ${idx} down`)
  }

}


customElements.define("con-trols", Controls)
