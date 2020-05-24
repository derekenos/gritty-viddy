
const gpu = new GPU()

export function applyPixelFilters(filters, imageData) {
  let data = imageData.data
  const numFilters = filters.length
  const lastI = numFilters - 1
  for (let i = 0; i < numFilters; i += 1) {
    const filter = filters[i]
    filter.constants.w = imageData.width
    filter.constants.h = imageData.height
    filter.setOutput([ imageData.width, imageData.height ])
    filter.setPipeline(i > 0)
    data = filter(data)
  }
  const start = Date.now()
  const renderedValues = data.renderValues()
  data = new Uint8ClampedArray(renderedValues)
  console.log(`That took: ${Date.now() - start} ms`)
  return new ImageData(data, imageData.width, imageData.height)
}
