
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
  for (let [ i, col, row, ...pixel ] of pixelIterator(imageData)) {
    for (let filter of filters) {
      pixel = filter(pixel, i, col, row)
    }
    imageData.data[i] = pixel[0]
    imageData.data[i + 1] = pixel[1]
    imageData.data[i + 2] = pixel[2]
    imageData.data[i + 3] = pixel[3]
  }
  return imageData
}
