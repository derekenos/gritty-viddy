
// utilitiy functions

// from: https://stackoverflow.com/a/596241
const calcPixelBrightness = ([ r, g, b, a ]) =>
  r * 0.299 + g * 0.587 + b * 0.114 * (a / 255)

const clamp = x => Math.max(Math.min(x, 255), 0)


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

export const brightnessFilter = factor => ([ r, g, b, a ]) => {
  r = clamp(r + r * factor)
  g = clamp(g + g * factor)
  b = clamp(b + b * factor)
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

export const rowBlankerFilter = ( predicate, fill = [ 0, 0, 0, 255 ]) => (pixel, i, col, row) => {
  return predicate(row) ? fill : pixel
}


// colBlankerFilter

export const colBlankerFilter = ( predicate, fill = [ 0, 0, 0, 255 ]) => (pixel, i, col, row) => {
  return predicate(col) ? fill : pixel
}
