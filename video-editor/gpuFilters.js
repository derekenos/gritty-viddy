
import  *  as PF from "./pixelFilters.js"


const gpu = new GPU()


///////////////////////////////////////////////////////////////////////////////
// Utility Functions
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

export const thresholdFilter = ({ threshold }) => gpu.createKernel(function (data) {
  const { threshold } = this.constants
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(thresholdFilter(pixel, threshold))
})
  .setFunctions([ getContext, setColor, PF.calcPixelBrightness, PF.thresholdFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)
  .setConstants({ threshold })


// Brightness Filter

export const brightnessFilter = ({ factor }) => gpu.createKernel(function (data) {
  const { factor } = this.constants
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(brightnessFilter(pixel, factor))
})
  .setFunctions([ getContext, setColor, PF.clamp8, PF.brightnessFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)
  .setConstants({ factor })


// Channel Filter

export const channelFilter = ({ r, g, b }) => gpu.createKernel(function (data) {
  const { r, g, b } = this.constants
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(channelFilter(pixel, r, g, b))
})
  .setFunctions([ getContext, setColor, PF.channelFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)
  .setConstants({ r, g, b })


// Invert Filter

export const invertFilter = () => gpu.createKernel(function (data) {
  const [ i, col, row ] = getContext()
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
  setColor(invertFilter(pixel))
})
  .setFunctions([ getContext, setColor, PF.invertFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)


// Color Balance Filter

export const colorBalanceFilter = ({ rDelta, gDelta, bDelta }) => gpu.createKernel(function (data) {
    const { rDelta, gDelta, bDelta } = this.constants
    const [ i, col, row ] = getContext()
    const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
    setColor(colorBalanceFilter(pixel, rDelta, gDelta, bDelta))
  })
    .setFunctions([ getContext, setColor, PF.clamp8, PF.colorBalanceFilter ])
    .setDynamicOutput(true)
    .setGraphical(true)
    .setConstants({ rDelta, gDelta, bDelta })


// Color Reducer Filter

export const colorReducerFilter = ({ mask }) => gpu.createKernel(function (data) {
    const { mask } = this.constants
    const [ i, col, row ] = getContext()
    const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
    setColor(colorReducerFilter(pixel, mask))
  })
    .setFunctions([ getContext, setColor, PF.clamp8, PF.colorReducerFilter ])
    .setDynamicOutput(true)
    .setGraphical(true)
    .setConstants({ mask })


// Row Blanker Filter

export const rowBlankerFilter = ({ nth }) => gpu.createKernel(function (data) {
    const { nth } = this.constants
    const [ i, col, row ] = getContext()
    const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
    setColor(rowBlankerFilter(pixel, nth, row))
  })
    .setFunctions([ getContext, setColor, PF.clamp8, PF.rowBlankerFilter ])
    .setDynamicOutput(true)
    .setGraphical(true)
    .setConstants({ nth })


// Col Blanker Filter

export const colBlankerFilter = ({ nth }) => gpu.createKernel(function (data) {
    const { nth } = this.constants
    const [ i, col, row ] = getContext()
    const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
    setColor(colBlankerFilter(pixel, nth, col))
  })
    .setFunctions([ getContext, setColor, PF.clamp8, PF.colBlankerFilter ])
    .setDynamicOutput(true)
    .setGraphical(true)
    .setConstants({ nth })