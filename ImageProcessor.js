
import Base from "./Base.js"
import { TOPICS, subscribe } from "./pubSub.js"
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

    subscribe(TOPICS.FILTERS_UPDATED, this.filtersUpdatedHandler.bind(this))
    subscribe(TOPICS.PARAMS_UPDATE, this.paramValueUpdateHandler.bind(this))
  }

  getFilterByName (name) {
    return (this.useGPU ? GPU_FILTERS : CPU_FILTERS)[`${name}Filter`]
  }

  filtersUpdatedHandler (filters) {
    this.filters = []
    filters.forEach(([ filterId, filterName, filterParamsObj ]) => {
      const filterFn = this.getFilterByName(filterName)
      // If a params obj wasn't specified, use the defaults.
      if (Object.keys(filterParamsObj).length === 0) {
        filterParamsObj = FILTER_NAME_PARAM_DEFAULT_MAP.get(filterName)
      }
      const filterParamsArr = paramsObjectToArray(filterName, filterParamsObj)
      this.filters.push([ filterId, filterName, filterFn, filterParamsArr ])
    })
  }

  paramValueUpdateHandler ([ filterId, name, value ]) {
    // Update the local filter param and publish the new filters.
    const filters = this.filters.filter(([ id ]) => id === filterId)
    if (filters.length === 0) {
      console.warn(`No matching filter for idx: ${filterIdx}`)
      return
    }
    const [, filterName,, paramsArr ] = filters[0]
    // Find param index.
    const i = FILTER_NAME_PARAM_KEY_ARR_POS_MAP.get(filterName).indexOf(name)
    paramsArr[i] = value
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
