
import  *  as PF from "./filters.js"


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
  const i = 4 * (col + this.constants.w * (this.constants.h - row))
  return [ i, col, row ]
}


function setColor (pixel) {
  const [ r, g, b, a ] = pixel
  this.color(r / 255, g / 255, b / 255, a / 255)
}


///////////////////////////////////////////////////////////////////////////////
// GPU Filter Functions
///////////////////////////////////////////////////////////////////////////////

// Threshold Filter

export const thresholdFilter = gpu.createKernel(function (data, params) {
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(thresholdFilter(pixel, params, i, col, row))
})
  .setFunctions([ getContext, setColor, PF.calcPixelBrightness, PF.thresholdFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Brightness Filter

export const brightnessFilter = gpu.createKernel(function (data, params) {
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(brightnessFilter(pixel, params, i, col, row))
})
  .setFunctions([ getContext, setColor, PF.clamp8, PF.brightnessFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Channel Filter

export const channelFilter = gpu.createKernel(function (data, params) {
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(channelFilter(pixel, params, i, col, row))
})
  .setFunctions([ getContext, setColor, PF.channelFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Color Gain Filter

export const colorGainFilter = gpu.createKernel(function (data, params) {
    const [ i, col, row ] = getContext()
    const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
    setColor(colorGainFilter(pixel, params, i, col, row))
  })
    .setFunctions([ getContext, setColor, PF.clamp8, PF.colorGainFilter ])
    .setDynamicOutput(true)
    .setGraphical(true)


// Color Reducer Filter

export const colorReducerFilter = gpu.createKernel(function (data, params) {
    const [ i, col, row ] = getContext()
    const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
    setColor(colorReducerFilter(pixel, params, i, col, row))
  })
    .setFunctions([ getContext, setColor, PF.clamp8, PF.colorReducerFilter ])
    .setDynamicOutput(true)
    .setGraphical(true)


// Row Blanker Filter

export const rowBlankerFilter = gpu.createKernel(function (data, params) {
    const [ i, col, row ] = getContext()
    const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
    setColor(rowBlankerFilter(pixel, params, i, col, row))
  })
    .setFunctions([ getContext, setColor, PF.clamp8, PF.rowBlankerFilter ])
    .setDynamicOutput(true)
    .setGraphical(true)


// Col Blanker Filter

export const colBlankerFilter = gpu.createKernel(function (data, params) {
    const [ i, col, row ] = getContext()
    const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
    setColor(colBlankerFilter(pixel, params, i, col, row))
  })
    .setFunctions([ getContext, setColor, PF.clamp8, PF.colBlankerFilter ])
    .setDynamicOutput(true)
    .setGraphical(true)


// Invert Filter

export const invertFilter = gpu.createKernel(function (data, params) {
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(invertFilter(pixel, params, i, col, row))
})
  .setFunctions([ getContext, setColor, PF.invertFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)
