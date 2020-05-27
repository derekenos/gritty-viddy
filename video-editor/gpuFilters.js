
import  *  as FILTERS from "./filters.js"


const gpu = new GPU()


///////////////////////////////////////////////////////////////////////////////
// General Utility Functions
///////////////////////////////////////////////////////////////////////////////

export function applyFilters(filters, imageData) {
  const numFilters = filters.length
  let data = imageData.data
  for (let i = 0; i < numFilters; i += 1) {
    const [ filter, params ] = filters[i]
    filter.setOutput([ imageData.width, imageData.height ])
    filter.setConstants({
      w: imageData.width,
      h: imageData.height,
    })
    // gpu.js doesn't like when params is an empty array, so make it non-empty.
    filter(data, params.length ? params : [0])
    data = filter.getPixels()
  }
  return new ImageData(data, imageData.width, imageData.height)
}


///////////////////////////////////////////////////////////////////////////////
// Kernel Utility Functions
///////////////////////////////////////////////////////////////////////////////

// The "this" in these functions will resolve to the kernel that calls it.

function getContext () {
  const row = this.thread.y
  const col = this.thread.x
  const i = 4 * (col + (this.constants.w - 1) * (this.constants.h - 1 - row))
  return [ i, col, row ]
}


function setColor (pixel) {
  const [ r, g, b, a ] = pixel
  this.color(r / 255, g / 255, b / 255, a / 255)
}


///////////////////////////////////////////////////////////////////////////////
// GPU-agnostic Filter Functions
///////////////////////////////////////////////////////////////////////////////

// Threshold Filter

export const thresholdFilter = gpu.createKernel(function (data, params) {
  const { w, h } = this.constants
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(thresholdFilter(pixel, params, i, col, row, data, w, h))
})
  .setFunctions([ getContext, setColor, FILTERS.calcPixelBrightness, FILTERS.thresholdFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Brightness Filter

export const brightnessFilter = gpu.createKernel(function (data, params) {
  const { w, h } = this.constants
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(brightnessFilter(pixel, params, i, col, row, data, w, h))
})
  .setFunctions([ getContext, setColor, FILTERS.clamp8, FILTERS.brightnessFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Channel Filter

export const channelFilter = gpu.createKernel(function (data, params) {
  const { w, h } = this.constants
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(channelFilter(pixel, params, i, col, row, data, w, h))
})
  .setFunctions([ getContext, setColor, FILTERS.channelFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Color Gain Filter

export const colorGainFilter = gpu.createKernel(function (data, params) {
  const { w, h } = this.constants
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(colorGainFilter(pixel, params, i, col, row, data, w, h))
})
  .setFunctions([ getContext, setColor, FILTERS.clamp8, FILTERS.colorGainFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Color Reducer Filter

export const colorReducerFilter = gpu.createKernel(function (data, params) {
  const { w, h } = this.constants
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(colorReducerFilter(pixel, params, i, col, row, data, w, h))
})
  .setFunctions([ getContext, setColor, FILTERS.clamp8, FILTERS.colorReducerFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Row Blanker Filter

export const rowBlankerFilter = gpu.createKernel(function (data, params) {
  const { w, h } = this.constants
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(rowBlankerFilter(pixel, params, i, col, row, data, w, h))
})
  .setFunctions([ getContext, setColor, FILTERS.clamp8, FILTERS.rowBlankerFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Col Blanker Filter

export const colBlankerFilter = gpu.createKernel(function (data, params) {
  const { w, h } = this.constants
   const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(colBlankerFilter(pixel, params, i, col, row, data, w, h))
})
  .setFunctions([ getContext, setColor, FILTERS.clamp8, FILTERS.colBlankerFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Invert Filter

export const invertFilter = gpu.createKernel(function (data, params) {
  const { w, h } = this.constants
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(invertFilter(pixel, params, i, col, row, data, w, h))
})
  .setFunctions([ getContext, setColor, FILTERS.invertFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Y-Plot Filter

export const audioPlotFilter = gpu.createKernel(function (data, params) {
  const { w, h } = this.constants
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(audioPlotFilter(pixel, params, i, col, row, data, w, h))
})
  .setFunctions([ getContext, setColor, FILTERS.clamp8, FILTERS.audioPlotFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


///////////////////////////////////////////////////////////////////////////////
//
// GPU-specific Filter Functions
//
// These functions must have their logic implemented in the GPU kernel function
// instead of leveraging FILTERS.* functions because they require access to
// the entire `data` array, and it's not currently possible to pass this array
// as an argument to an internal function.
// See: https://github.com/gpujs/gpu.js/issues/394
//
///////////////////////////////////////////////////////////////////////////////

// Flip Horizontal Filter

export const flipHorizontalFilter = gpu.createKernel(function (data, params) {
  const { w, h } = this.constants
  const [ i, col, row ] = getContext()
  i = 4 * (w - 1 - col + w * (h - row))
  const pixel = [ data[i], data[i + 1], data[i + 2], data[i + 3] ]
  setColor(pixel)
})
  .setFunctions([ getContext, setColor ])
  .setDynamicOutput(true)
  .setGraphical(true)
