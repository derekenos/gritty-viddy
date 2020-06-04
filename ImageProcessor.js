
import Base from "./Base.js"
import { Element } from "./lib/domHelpers.js"
import * as CPU_FILTERS from "./filters.js"
import * as GPU_FILTERS from "./gpuFilters.js"


const STYLE = `
  canvas {
    width: 100%;
  }
`


// The filter functions need params to be a positionally-mapped array of
// scalars because that's what gpu.js can deal with, but UI-wise, it's better
// for us to deal in named parameters, so this maps the param names to their
// array position so that we can do the translation on filter function call.
export const FILTER_NAME_PARAM_KEY_ARR_POS_MAP = new Map([
  [ "threshold", [ "threshold" ] ],
  [ "brightness", [ "factor" ] ],
  [ "channel", [ "keepR", "keepG", "keepB" ] ],
  [ "colorGain", [ "rGain", "gGain", "bGain" ] ],
  [ "colorReducer", [ "mask" ] ],
  [ "rowBlanker", [ "nth" ] ],
  [ "colBlanker", [ "nth" ] ],
  [ "invert", [ ] ],
  [ "audioPlot", [ ] ],
  [ "flipHorizontal", [ ] ],
  [ "verticalMirror", [ ] ],
  [ "horizontalMirror", [ ] ],
])

// Define default param values to use when adding a new filter to the chain.
const FILTER_NAME_PARAM_DEFAULT_MAP = new Map([
  [ "threshold", { threshold: 100 } ],
  [ "brightness", { factor: 1 } ],
  [ "channel", { keepR: true, keepG: true, keepB: true } ],
  [ "colorGain", { rGain: 0, gGain: 0, bGain: 0 } ],
  [ "colorReducer", { mask: 0x88 } ],
  [ "rowBlanker", { nth: 2 } ],
  [ "colBlanker", { nth: 2 } ],
  [ "invert", {} ],
  [ "audioPlot", {} ],
  [ "flipHorizontal", {} ],
  [ "verticalMirror", {} ],
  [ "horizontalMirror", {} ],
])


// Return the object-type filter function params as a positionally mapped array.
const paramsObjectToArray = (filterName, paramsObj) =>
  FILTER_NAME_PARAM_KEY_ARR_POS_MAP.get(filterName).map(k => paramsObj[k])


export default class ImageProcessor extends Base {
  constructor () {
    super()
    this.ready = false
    this.useGPU = true
    this.filters = []
  }

  connectedCallback () {
    super.connectedCallback(STYLE)

    this.width = parseInt(this.getAttribute("width") || "1280")
    this.height = parseInt(this.getAttribute("height") || "720")

    this.wrapper = Element(`<div></div>`)
    this.shadowRoot.appendChild(this.wrapper)

    this.canvas = Element(
      `<canvas width="${this.width}" height="${this.height}">
       </canvas>
      `
    )
    this.canvasCtx = this.canvas.getContext("2d")
    this.wrapper.appendChild(this.canvas)


    this.ready = true
  }

  getFilterByName (name) {
    return (this.useGPU ? GPU_FILTERS : CPU_FILTERS)[`${name}Filter`]
  }

  addFilter (filterName, filterParamsObj = {}) {
    // Add a filter to the filter chain.
    const filterFn = this.getFilterByName(filterName)
    // If a params obj wasn't specified, use the defaults.
    if (Object.keys(filterParamsObj).length === 0) {
      filterParamsObj = FILTER_NAME_PARAM_DEFAULT_MAP.get(filterName)
    }
    const filterParamsArr = paramsObjectToArray(filterName, filterParamsObj)
    this.filters.push([ filterFn, filterParamsArr ])
  }

  process (imageData) {
    imageData = (this.useGPU ? GPU_FILTERS : CPU_FILTERS)
      .applyFilters(this.filters, imageData)
    this.canvasCtx.putImageData(imageData, 0, 0)
  }
}


customElements.define("image-processor", ImageProcessor)
