
function* pixelIterator (imageData) {
  const maxI = imageData.width * imageData.height * 4
  const data = imageData.data
  let row = 0
  let col = 0
  for (let i = 0; i < maxI; i += 4) {
    yield [ i, col, row, data[i], data[i + 1], data[i + 2], data[i + 3] ]
    col += 1
    if (col === imageData.width) {
      row += 1
      col = 0
    }
  }
}

export function applyPixelFilters(filters, imageData) {
  const NUM_PIXELS = imageData.width * imageData.height
  const gpu = new GPU()
  const kernel = gpu.createKernel(function (data) {
    const i = 4 * (this.thread.x + this.constants.w * (this.constants.h - this.thread.y))
    const r = data[i]
    const g = data[i+1]
    const b = data[i+2]
    const a = data[i+3]
    this.color(r / 256, g / 256, b / 256, a / 256)
  })
    .setConstants({ w: imageData.width, h: imageData.height })
    .setOutput([imageData.width, imageData.height])
    .setGraphical(true)

  kernel(imageData.data)
  return new ImageData(kernel.getPixels(), imageData.width, imageData.height)
}
