
import Base from "./Base.js"
import FilterRow from "./FilterRow.js"
import { Element } from "./lib/domHelpers.js"
import { TOPICS, publish } from "./pubSub.js"


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
    this.ready = false
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

    // Render the filters list.
    this.renderFilters()

    this.ready = true
  }

  setFilters (filters) {
    this.filters = filters
    if (this.ready) {
      this.renderFilters()
    }
  }

  renderFilters () {
    // (re)Render the filters list.
    const filtersEl = this.wrapper.querySelector(".filters > ol")
    // Remove all existing filter rows.
    Array.from(filtersEl.children).forEach(x => x.remove())
    // Add all the current rows.
    this.filters.forEach(([ filterName, filterParams ], idx) => {
      const filterRow = Element(
        `<filter-row name="${filterName}" idx="${idx}"></filter-row>`
      )
      for (let [k, v] of Object.entries(filterParams)) {
        filterRow.dataset[k] = v
      }
      filtersEl.appendChild(filterRow)
    })
  }
}


customElements.define("con-trols", Controls)
