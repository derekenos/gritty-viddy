
// utilitiy functions

// from: https://stackoverflow.com/a/596241
const calcPixelBrightness = ([ r, g, b, a ]) =>
  r * 0.299 + g * 0.587 + b * 0.114 * (a / 255)


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
    pixel[i] = Math.max(Math.min(pixel[i] + pixel[i] * factor, 255), 0)
  }
  return pixel
}
