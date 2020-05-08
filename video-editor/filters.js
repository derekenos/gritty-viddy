
function* pixelIterator (imageData) {
  const maxI = imageData.width * imageData.height * 4
  const data = imageData.data
  for (let i = 0; i < maxI; i += 4) {
    yield [ i, data[i], data[i + 1], data[i + 2], data[i + 3] ]
  }
}

export function applyPixelFilters(filters, imageData) {
  for (let [ i, ...pixel ] of pixelIterator(imageData)) {
    for (let filter of filters) {
      pixel = filter(pixel)
    }
    imageData.data[i] = pixel[0]
    imageData.data[i + 1] = pixel[1]
    imageData.data[i + 2] = pixel[2]
    imageData.data[i + 3] = pixel[3]
  }
  return imageData
}
