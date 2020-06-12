
export const FILTER_PRESET_NAMES = [
  "Default",
  "Holy Mountain",
  "Distant Digits",
  "2001",
]
export const FILTER_PRESETS = {
  get: name => {
    switch (name) {
        case "Default":
        return [
          [ 0, "brightness", { factor: "loudness * 10" } ],
          [ 1, "colorGain", { r: "Math.max(loudness * 10, 1)", g: "1", b: "1" } ],
          [ 2, "invert", { } ],
          [ 3, "rowBlanker", { nth: "Math.max(Math.floor(Math.random() * 200), 2)" } ],
        ]
        break

      case "Holy Mountain":
        return [
          [ 0, "threshold", { threshold: "255 - loudness * 2 * 255" } ],
          [ 1, "brightness", { factor: "loudness * 3" } ],
          [ 2, "invert", { } ],
          [ 3, "audioPlot", { } ],
          [ 4, "verticalMirror", { } ],
          [ 5, "horizontalMirror", { } ],
        ]
        break

      case "Distant Digits":
        return [
          [ 0, "rowBlanker", { nth: "5" } ],
          [ 1, "colorGain", { r: "2", g: "0", b: "0" } ],
          [ 2, "threshold", { threshold: "100" } ],
          [ 3, "invert", { } ],
        ]
        break

      case "2001":
        return [
          [ 0, "verticalMirror", { } ],
          [ 1, "horizontalMirror", { } ],
          [ 2, "colorReducer", { mask: "128" } ],
          [ 3, "brightness", { factor: "1" } ],
        ]
        break
    }
  }
}


export const TOPICS = Object.freeze(
  Object.fromEntries(
    [
      "ADD_FEED",
      "ADD_FILTER",
      "FEED_ADDED",
      "FILTER_CHANGE",
      "FULLSCREEN_TOGGLE",
      "MOVE_FILTER_DOWN",
      "MOVE_FILTER_UP",
      "PARAMS_UPDATE",
      "PRESET_CHANGE",
      "RECORD_START",
      "RECORD_STOP",
      "REMOVE_FILTER",
      "SWITCH_FEED",
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
  [ "blur", { level: 5 } ],
  [ "panZoom", { x: 0, y: 0, zoom: 2 } ],
])
