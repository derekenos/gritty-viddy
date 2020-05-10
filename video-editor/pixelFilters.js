
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

export const brightnessFilter = factor => pixel => {
  for (let i of [ 0, 1, 2 ]) {
    pixel[i] = clamp(pixel[i] + pixel[i] * factor)
  }
  return pixel
}


// colorBalanceFilter

export const colorBalanceFilter = (r, g, b) => pixel => {
  pixel[0] = clamp(pixel[0] + r)
  pixel[1] = clamp(pixel[1] + g)
  pixel[2] = clamp(pixel[2] + b)
  return pixel
}


// invertFilter

export const invertFilter = pixel => {
  pixel[0] = 255 - pixel[0]
  pixel[1] = 255 - pixel[1]
  pixel[2] = 255 - pixel[2]
  return pixel
}
