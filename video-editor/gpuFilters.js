
import  *  as PF from "./pixelFilters.js"


const gpu = new GPU()


///////////////////////////////////////////////////////////////////////////////
// Utility Functions
///////////////////////////////////////////////////////////////////////////////

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

  const row = this.thread.y
  const col = this.thread.x
  const i = 4 * (col + this.constants.w * (this.constants.h - row))
  let pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]

  setColor(thresholdFilter(pixel, threshold))
})
  .setFunctions([ setColor, PF.calcPixelBrightness, PF.thresholdFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)
  .setConstants({ threshold })


// Brightness Filter

export const brightnessFilter = ({ factor }) => gpu.createKernel(function (data) {
  const { factor } = this.constants

  const row = this.thread.y
  const col = this.thread.x
  const i = 4 * (col + this.constants.w * (this.constants.h - row))
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]

  setColor(brightnessFilter(pixel, factor))
})
  .setFunctions([ setColor, PF.clamp8, PF.brightnessFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)
  .setConstants({ factor })


// Channel Filter

export const channelFilter = ({ r, g, b }) => gpu.createKernel(function (data) {
  const { r, g, b } = this.constants

  const row = this.thread.y
  const col = this.thread.x
  const i = 4 * (col + this.constants.w * (this.constants.h - row))
  const pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]

  setColor(channelFilter(pixel, r, g, b))
})
  .setFunctions([ setColor, PF.channelFilter ])
  .setDynamicOutput(true)
  .setGraphical(true)
  .setConstants({ r, g, b })
