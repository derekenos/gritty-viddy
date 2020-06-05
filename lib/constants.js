
export const FILTER_PRESET_NAMES = [
  "Default",
  "Fine Trip",
]
export const FILTER_PRESETS = {
  get: name => {
    switch (name) {
        case "Default":
        return [
          [ 0, "brightness", { factor: "loudness * 2" } ],
          [ 1, "rowBlanker", { nth: "Date.now() % 200" } ],
          [ 2, "colorReducer", { mask: "0x68" } ],
          [ 3, "audioPlot", { } ],
        ]
        break
      case "Fine Trip":
        return [
          [ 0, "threshold", { threshold: "255 - loudness * 2 * 255" } ],
          [ 1, "brightness", { factor: "loudness * 3" } ],
          [ 2, "invert", { } ],
          [ 3, "audioPlot", { } ],
          [ 4, "verticalMirror", { } ],
          [ 5, "horizontalMirror", { } ],
        ]
    }
  }
}


export const TOPICS = Object.freeze(
  Object.fromEntries(
    [
      "FULLSCREEN_TOGGLE",
      "FILTER_CHANGE",
      "PARAMS_UPDATE",
      "REMOVE_FILTER",
      "MOVE_FILTER_UP",
      "MOVE_FILTER_DOWN",
      "PRESET_CHANGE",
      "ADD_FILTER",
    ].map(x => [ x, x ])
  )
)

// Define default param values to use when adding a new filter to the chain.
export const FILTER_NAME_PARAM_DEFAULT_MAP = new Map([
  [ "threshold", { threshold: 100 } ],
  [ "brightness", { factor: 1 } ],
  [ "channel", { r: 1, g: 1, b: 1 } ],
  [ "colorGain", { r: 1, g: 1, b: 1 } ],
  [ "colorReducer", { mask: 0x88 } ],
  [ "rowBlanker", { nth: 2 } ],
  [ "colBlanker", { nth: 2 } ],
  [ "invert", {} ],
  [ "audioPlot", {} ],
  [ "flipHorizontal", {} ],
  [ "verticalMirror", {} ],
  [ "horizontalMirror", {} ],
])
