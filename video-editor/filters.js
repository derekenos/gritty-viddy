
const gpu = new GPU()

export function applyPixelFilters(filters, imageData) {
  const numFilters = filters.length
  let data = imageData.data
  for (let i = 0; i < numFilters; i += 1) {
    const filter = filters[i]
    if (filter.constants) {
      filter.constants.w = imageData.width
      filter.constants.h = imageData.height
    } else {
      filter.setConstants({
        w: imageData.width,
        h: imageData.height
      })
    }
    filter.setOutput([ imageData.width, imageData.height ])
    filter(data)
    data = filter.getPixels()
  }
  return new ImageData(data, imageData.width, imageData.height)
}
