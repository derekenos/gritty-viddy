
import Base from "./Base.js"
import {
  FILTER_NAME_PARAM_DEFAULT_MAP,
  FILTER_PRESETS,
  TOPICS,
} from "../lib/constants.js"
import { Element } from "../lib/domHelpers.js"
import * as CPU_FILTERS from "../lib/filters.js"
import * as GPU_FILTERS from "../lib/gpuFilters.js"
import { subscribe } from "../lib/pubSub.js"
import { getFilterById } from "../lib/utils.js"


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
  [ "channel", [ "r", "g", "b" ] ],
  [ "colorGain", [ "r", "g", "b" ] ],
  [ "colorReducer", [ "mask" ] ],
  [ "rowBlanker", [ "nth" ] ],
  [ "colBlanker", [ "nth" ] ],
  [ "invert", [ ] ],
  [ "audioPlot", [ ] ],
  [ "flipHorizontal", [ ] ],
  [ "verticalMirror", [ ] ],
  [ "horizontalMirror", [ ] ],
  [ "blur", [ "level" ] ],
])


// Return the object-type filter function params as a positionally mapped array.
const paramsObjectToArray = (filterName, paramsObj) =>
  FILTER_NAME_PARAM_KEY_ARR_POS_MAP.get(filterName).map(k => paramsObj[k])


function evalParamsArr (paramsArr, { loudness, samples }) {
  // Attempt to eval the parameter array strings to interpolate loudness/samples
  // and convert to a float.
  const finalArr = []
  paramsArr.forEach(s => {
    let evalResult
    try {
      evalResult = parseFloat(eval(s))
    } catch (e) {
    }
    if (!(typeof evalResult === "number") || Number.isNaN(evalResult)) {
      throw new Error(`eval did not yield number on: ${s}`)
    }
    finalArr.push(evalResult)
  })
  return finalArr
}


export default class ImageProcessor extends Base {
  constructor () {
    super()
    this.useGPU = false
    this.filters = []
  }

  connectedCallback () {
    super.connectedCallback(STYLE)

    this.width = parseInt(this.getAttribute("width") || "1280")
    this.height = parseInt(this.getAttribute("height") || "720")
    this.useGPU = !this.hasAttribute("no-gpu")

    this.wrapper = Element(`<div></div>`)
    this.shadowRoot.appendChild(this.wrapper)

    this.canvas = Element(
      `<canvas width="${this.width}" height="${this.height}">
       </canvas>
      `
    )
    this.canvasCtx = this.canvas.getContext("2d")
    this.wrapper.appendChild(this.canvas)

    // Select the Default preset.
    this.presetChangeHandler("Default")

    subscribe(TOPICS.FILTER_CHANGE, this.filterChangeHandler.bind(this))
    subscribe(TOPICS.PARAMS_UPDATE, this.paramValueUpdateHandler.bind(this))
    subscribe(TOPICS.REMOVE_FILTER, this.removeFilterHandler.bind(this))
    subscribe(TOPICS.MOVE_FILTER_UP, this.moveFilterUpHandler.bind(this))
    subscribe(TOPICS.MOVE_FILTER_DOWN, this.moveFilterDownHandler.bind(this))
    subscribe(TOPICS.PRESET_CHANGE, this.presetChangeHandler.bind(this))
    subscribe(TOPICS.ADD_FILTER, this.addFilterHandler.bind(this))
  }

  getFilterByName (name) {
    return (this.useGPU ? GPU_FILTERS : CPU_FILTERS)[`${name}Filter`]
  }

  convertIncomingFilter (filter) {
    // Convert the incoming filter to an internal array that includes the
    // function object itself and a params object converted to an array.
    const [ filterId, filterName, filterParamsObj ] = filter
    const filterFn = this.getFilterByName(filterName)
    const filterParamsArr = paramsObjectToArray(filterName, filterParamsObj)
    return [ filterId, filterName, filterFn, filterParamsArr ]
  }

  filterChangeHandler ([ filterId, newFilterName ]) {
    const [ filter, i ] = getFilterById(this.filters, filterId)
    const [ ,,, params ] = this.filters[i]
    const filterFn = this.getFilterByName(newFilterName)
    const paramsArr = paramsObjectToArray(
      newFilterName,
      FILTER_NAME_PARAM_DEFAULT_MAP.get(newFilterName)
    )
    this.filters[i] = [ filterId, newFilterName, filterFn, paramsArr ]
  }

  presetChangeHandler (presetName) {
    if (presetName) {
      this.filters = FILTER_PRESETS.get(presetName).map(
        this.convertIncomingFilter.bind(this)
      )
    }
  }

  paramValueUpdateHandler ([ filterId, name, value ]) {
    // Update the local filter param and publish the new filters.
    const [ filter ] = getFilterById(this.filters, filterId)
    if (!filter) {
      return
    }
    const [, filterName,, paramsArr ] = filter
    // Find param index.
    const i = FILTER_NAME_PARAM_KEY_ARR_POS_MAP.get(filterName).indexOf(name)
    paramsArr[i] = value
  }

  removeFilterHandler (filterId) {
    const [ filter, i ] = getFilterById(this.filters, filterId)
    this.filters.splice(i, 1)
  }

  moveFilterUpHandler (filterId) {
    const [ filter, i ] = getFilterById(this.filters, filterId)
    if (i > 0) {
      this.filters.splice(i, 1)
      this.filters.splice(i - 1, 0, filter)
    }
  }

  moveFilterDownHandler (filterId) {
    const [ filter, i ] = getFilterById(this.filters, filterId)
    if (i < this.filters.length - 1) {
      this.filters.splice(i, 1)
      this.filters.splice(i + 1, 0, filter)
    }
  }

  addFilterHandler (filter) {
    this.filters.push(this.convertIncomingFilter(filter))
  }

  process (imageData, { loudness, samples }) {
    let filters
    try {
      // Strip the leading filterId element from this.filters and eval the
      // params strings.
      filters = this.filters.map(([, name, fn, paramsArr]) => {
        // Special case audioPlot that needs samples array as its sole argument.
        if (name === "audioPlot") {
          paramsArr = samples
        } else {
          paramsArr = evalParamsArr(paramsArr, { loudness, samples })
        }
        return [ fn, paramsArr ]
      })
    }
    catch (e) {
      return
    }
    imageData = (this.useGPU ? GPU_FILTERS : CPU_FILTERS)
      .applyFilters(filters, imageData)
    this.canvasCtx.putImageData(imageData, 0, 0)
  }
}


customElements.define("image-processor", ImageProcessor)
