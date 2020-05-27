
///////////////////////////////////////////////////////////////////////////////
// Utility Functions
///////////////////////////////////////////////////////////////////////////////

// from: https://stackoverflow.com/a/596241
export function calcPixelBrightness (pixel) {
  return pixel[0] * 0.299 + pixel[1] * 0.587 + pixel[2] * 0.114 * (pixel[3] / 255)
}


export function clamp8 (x) {
  return Math.max(Math.min(x, 255), 0)
}


function* pixelIterator (imageData) {
  const maxI = imageData.width * imageData.height * 4
  const data = imageData.data
  let row = imageData.height - 1
  let col = 0
  for (let i = 0; i < maxI; i += 4) {
    const pixel = [ data[i], data[i + 1], data[i + 2], data[i + 3] ]
    yield [ i, col, row, pixel ]
    col += 1
    if (col === imageData.width) {
      row -= 1
      col = 0
    }
  }
}

export function applyFilters (filters, imageData) {
  const FRAME_BUFFER_FILTERS = [
    flipHorizontalFilter,
    verticalMirrorFilter,
    horizontalMirrorFilter,
  ]
  for (let [ filter, params ] of filters) {
    const useFrameBuffer = FRAME_BUFFER_FILTERS.includes(filter)
    const workingImageData = useFrameBuffer ? new ImageData(imageData.width, imageData.height) : imageData
    for (let [ i, col, row, pixel] of pixelIterator(imageData)) {
      pixel = filter(pixel, params, i, col, row, imageData.data, imageData.width, imageData.height)
      workingImageData.data[i] = pixel[0]
      workingImageData.data[i + 1] = pixel[1]
      workingImageData.data[i + 2] = pixel[2]
      workingImageData.data[i + 3] = pixel[3]
    }
    imageData = workingImageData
  }
  return imageData
}


///////////////////////////////////////////////////////////////////////////////
// Filter Functions
///////////////////////////////////////////////////////////////////////////////


// Threshold Filter

export function thresholdFilter (pixel, params, i, col, row, data, width, height) {
  const [ threshold ] = params
  const brightness = calcPixelBrightness(pixel)
  if (brightness >= threshold) {
    pixel = [ 255, 255, 255, 255 ]
  }
  return pixel
}


// Brightness Filter

export function brightnessFilter (pixel, params, i, col, row, data, width, height) {
  let [ r, g, b, a ] = pixel
  const [ factor ] = params
  r = clamp8(r + r * factor)
  g = clamp8(g + g * factor)
  b = clamp8(b + b * factor)
  return [ r, g, b, a ]
}


// Channel Filter

export function channelFilter (pixel, params, i, col, row, data, width, height) {
  const [ keepR, keepG, keepB ] = params
  pixel[0] = keepR === 0 ? 0 : pixel[0]
  pixel[1] = keepG === 0 ? 0 : pixel[1]
  pixel[2] = keepB === 0 ? 0 : pixel[2]
  return pixel
}


// Color Gain Filter

export function colorGainFilter (pixel, params, i, col, row, data, width, height) {
  let [ r, g, b, a ] = pixel
  const [ rGain, gGain, bGain ] = params
  r = clamp8(r + r * rGain)
  g = clamp8(g + g * gGain)
  b = clamp8(b + b * bGain)
  return [ r, g, b, a ]
}



// Color Reducer Filter

export function colorReducerFilter (pixel, params, i, col, row, data, width, height) {
  let [ r, g, b, a ] = pixel
  const [ mask ] = params
  r = r & mask
  g = g & mask
  b = b & mask
  return [ r, g, b, a ]
}


// Row Blanker Filter

export function rowBlankerFilter (pixel, params, i, col, row, data, width, height) {
  const [ nth ] = params
  return row % nth === 0 ? [0, 0, 0, 255] : pixel
}


// Col Blanker Filter

export function colBlankerFilter (pixel, params, i, col, row, data, width, height) {
  const [ nth ] = params
  return col % nth === 0 ? [0, 0, 0, 255] : pixel
}


// Invert Filter

export function invertFilter (pixel, params, i, col, row, data, width, height) {
  let [ r, g, b, a ] = pixel
  return [ 255 - r, 255 - g, 255 - b, a ]
}


// Y-Plot Filter

export function audioPlotFilter (pixel, params, i, col, row, data, width, height) {
  // params is an array of audio samples in the range 0 - 1.
  const [ r, g, b, a ] = pixel
  const d = ((row / height) >= params[col]) ? 64 : -64
  return [ clamp8(r + d), clamp8(g + d), 255 - b, a ]
}


// Flip Horizontal Filter

export function flipHorizontalFilter (pixel, params, i, col, row, data, width, height) {
  i = 4 * (width - 1 - col + width * (height - row))
  pixel = [ data[i], data[i + 1], data[i + 2], data[i + 3] ]
  return pixel
}


// Vertical Mirror Filter

export function verticalMirrorFilter (pixel, params, i, col, row, data, width, height) {
  const middleRow = Math.floor(height / 2)
  if (row >= middleRow) {
    i = 4 * (col + width * row)
  }
  pixel = [ data[i], data[i + 1], data[i + 2], data[i + 3] ]
  return pixel
}


// Horizontal Mirror Filter

export function horizontalMirrorFilter (pixel, params, i, col, row, data, width, height) {
  const middleCol = Math.floor(width / 2)
  if (col >= middleCol) {
    i = 4 * (middleCol - col - middleCol + width * (height - 1 - row))
  }
  pixel = [ data[i], data[i + 1], data[i + 2], data[i + 3] ]
  return pixel
}
