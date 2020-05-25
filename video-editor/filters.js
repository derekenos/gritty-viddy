
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
  let row = 0
  let col = 0
  for (let i = 0; i < maxI; i += 4) {
    const pixel = [ data[i], data[i + 1], data[i + 2], data[i + 3] ]
    yield [ i, col, row, pixel ]
    col += 1
    if (col === imageData.width) {
      row += 1
      col = 0
    }
  }
}


export function applyFilters (filters, imageData) {
  for (let [ i, col, row, pixel] of pixelIterator(imageData)) {
    for (let [ filter, params ] of filters) {
      pixel = filter(pixel, params, i, col, row)
    }
    imageData.data[i] = pixel[0]
    imageData.data[i + 1] = pixel[1]
    imageData.data[i + 2] = pixel[2]
    imageData.data[i + 3] = pixel[3]
  }
  return imageData
}


///////////////////////////////////////////////////////////////////////////////
// Filter Functions
///////////////////////////////////////////////////////////////////////////////


// Threshold Filter

export function thresholdFilter (pixel, params, i, col, row) {
  const [ threshold ] = params
  const brightness = calcPixelBrightness(pixel)
  if (brightness >= threshold) {
    pixel = [ 255, 255, 255, 255 ]
  }
  return pixel
}


// Brightness Filter

export function brightnessFilter (pixel, params, i, col, row) {
  let [ r, g, b, a ] = pixel
  const [ factor ] = params
  r = clamp8(r + r * factor)
  g = clamp8(g + g * factor)
  b = clamp8(b + b * factor)
  return [ r, g, b, a ]
}


// Channel Filter

export function channelFilter (pixel, params, i, col, row) {
  const [ keepR, keepG, keepB ] = params
  pixel[0] = keepR === 0 ? 0 : pixel[0]
  pixel[1] = keepG === 0 ? 0 : pixel[1]
  pixel[2] = keepB === 0 ? 0 : pixel[2]
  return pixel
}


// Color Gain Filter

export function colorGainFilter (pixel, params, i, col, row) {
  let [ r, g, b, a ] = pixel
  const [ rGain, gGain, bGain ] = params
  r = clamp8(r + r * rGain)
  g = clamp8(g + g * gGain)
  b = clamp8(b + b * bGain)
  return [ r, g, b, a ]
}



// Color Reducer Filter

export function colorReducerFilter (pixel, params, i, col, row) {
  let [ r, g, b, a ] = pixel
  const [ mask ] = params
  r = r & mask
  g = g & mask
  b = b & mask
  return [ r, g, b, a ]
}


// Row Blanker Filter

export function rowBlankerFilter (pixel, params, i, col, row) {
  const [ nth ] = params
  return row % nth === 0 ? [0, 0, 0, 255] : pixel
}


// Col Blanker Filter

export function colBlankerFilter (pixel, params, i, col, row) {
  const [ nth ] = params
  return col % nth === 0 ? [0, 0, 0, 255] : pixel
}


// Invert Filter

export function invertFilter (pixel, params, i, col, row) {
  let [ r, g, b, a ] = pixel
  return [ 255 - r, 255 - g, 255 - b, a ]
}
