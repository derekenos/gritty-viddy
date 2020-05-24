
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


// colorBalanceFilter

export const colorBalanceFilter = (rVal, gVal, bVal) => ([ r, g, b, a ]) => {
  r = clamp(r + rVal)
  g = clamp(g + gVal)
  b = clamp(b + bVal)
  return [ r, g, b, a ]
}


// invertFilter

export const invertFilter = ([ r, g, b, a ]) => {
  r = 255 - r
  g = 255 - g
  b = 255 - b
  return [ r, g, b, a ]
}


// colorReducerFilter

export const colorReducerFilter = ( mask = 0x80 ) => ([ r, g, b, a ]) => {
  r = r & mask
  g = g & mask
  b = b & mask
  return [ r, g, b, a ]
}


// rowBlankerFilter

export function rowBlankerFilter (pixel, i, col, row) {
  const { rowBlankerFilterNth: nth } = this.constants
  return row % nth === 0 ? [0, 0, 0, 255] : pixel
}


// colBlankerFilter

export const colBlankerFilter = ( predicate, fill = [ 0, 0, 0, 255 ]) => (pixel, i, col, row) => {
  return predicate(col) ? fill : pixel
}
