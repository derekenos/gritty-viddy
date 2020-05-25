
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

///////////////////////////////////////////////////////////////////////////////
// Filter Functions
///////////////////////////////////////////////////////////////////////////////


// Threshold Filter

export function thresholdFilter (pixel, threshold) {
  const brightness = calcPixelBrightness(pixel)
  if (brightness >= threshold) {
    pixel = [ 255, 255, 255, 255 ]
  }
  return pixel
}


// Brightness Filter

export function brightnessFilter (pixel, factor) {
  let [ r, g, b, a ] = pixel
  r = clamp8(r + r * factor)
  g = clamp8(g + g * factor)
  b = clamp8(b + b * factor)
  return [ r, g, b, a ]
}


// Channel Filter

export function channelFilter (pixel, r, g, b) {
  pixel[0] = r ? pixel[0] : 0
  pixel[1] = g ? pixel[2] : 0
  pixel[2] = b ? pixel[3] : 0
  return pixel
}


// Invert Filter

export function invertFilter (pixel) {
  let [ r, g, b, a ] = pixel
  return [ 255 - r, 255 - g, 255 - b, a ]
}


// Color Balance Filter

export function colorBalanceFilter (pixel, rDelta, gDelta, bDelta) {
  const [ r, g, b, a ] = pixel
  r = clamp8(r + rDelta)
  g = clamp8(g + gDelta)
  b = clamp8(b + bDelta)
  return [ r, g, b, a ]
}



// Color Reducer Filter

export function colorReducerFilter (pixel, mask) {
  const [ r, g, b, a ] = pixel
  r = r & mask
  g = g & mask
  b = b & mask
  return [ r, g, b, a ]
}


// Row Blanker Filter

export function rowBlankerFilter (pixel, nth, row) {
  return row % nth === 0 ? [0, 0, 0, 255] : pixel
}


// Col Blanker Filter

export function colBlankerFilter (pixel, nth, col) {
  return col % nth === 0 ? [0, 0, 0, 255] : pixel
}
