
import {
  calcPixelBrightness,
  clamp8,
  brightnessFilter,
  rowBlankerFilter,
} from "./pixelFilters.js"


const gpu = new GPU()

const kernel = gpu.createKernel(
  function (data) {
    const row = this.thread.y
    const col = this.thread.x
    const i = 4 * (col + this.constants.w * (this.constants.h - row))

    let pixel = [ data[i], data[i+1], data[i+2], data[i+3] ]
    pixel = brightnessFilter(pixel, i, col, row)
    pixel = rowBlankerFilter(pixel, i, col, row)

    const [ r, g, b, a ] = pixel
    this.color(r / 256, g / 256, b / 256, a / 256)
  }
)
  .setGraphical(true)
  .setDynamicOutput(true)
  .setFunctions([
    calcPixelBrightness,
    clamp8,
    brightnessFilter,
    rowBlankerFilter,
  ])

export function applyPixelFilters(filters, imageData) {
  kernel
    .setConstants({
      w: imageData.width,
      h: imageData.height,
      brightnessFilterFactor: 2,
      rowBlankerFilterNth: 4,
    })
    .setOutput([imageData.width, imageData.height])

  kernel(imageData.data)
  return new ImageData(kernel.getPixels(), imageData.width, imageData.height)
}
