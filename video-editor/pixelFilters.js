
// utilitiy functions

// from: https://stackoverflow.com/a/596241
export function calcPixelBrightness (pixel) {
  return pixel[0] * 0.299 + pixel[1] * 0.587 + pixel[2] * 0.114 * (pixel[3] / 255)
}

export function clamp8 (x) {
  return Math.max(Math.min(x, 255), 0)
}


// channel

const channelPixelOffsetMap = { "r": 0, "g": 1, "b": 2, "a": 3 }

export const channelFilter = channels => pixel => {
  channels.forEach(channel => { pixel[channelPixelOffsetMap[channel]] = 0 })
  return pixel
}


// threshold

export const thresholdFilter = threshold => pixel => {
  const brightness = calcPixelBrightness(pixel)
  return brightness >= threshold ? [ 255, 255, 255, 255 ] : pixel
}


// brightnessFilter

export function brightnessFilter (pixel, i, col, row) {
  const [ r, g, b, a ] = pixel
  const { brightnessFilterFactor } = this.constants
  r = clamp8(r + r * brightnessFilterFactor)
  g = clamp8(g + g * brightnessFilterFactor)
  b = clamp8(b + b * brightnessFilterFactor)
  return [ r, g, b, a ]
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
