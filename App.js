
import Base from "./Base.js"
import VideoCanvas from "./VideoCanvas.js"
import ImageProcessor from "./ImageProcessor.js"
import Controls from "./Controls.js"
import { TOPICS, publish, subscribe } from "./pubSub.js"
import { getAudioParams } from "./lib/audio.js"
import { Element } from "./lib/domHelpers.js"


const STYLE = `
  .wrapper {
    position: relative;
  }

  video-canvas {
    position: absolute;
    z-index: 0;
  }

  image-processor {
    position: absolute;
    z-index: 1;
    width: 100%;
  }

  con-trols {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
  }
`


const FILTER_PRESETS = {
  "Default": [
  ],

  "Fine Trip": [
    [ "threshold", { threshold: "255 - loudness * 2 * 255" } ],
    [ "brightness", { factor: "loudness * 3" } ],
    [ "invert", { } ],
    [ "audioPlot", { } ],
    [ "verticalMirror", { } ],
    [ "horizontalMirror", { } ],
  ]
}


export default class GrittyViddy extends Base {
  constructor () {
    super()
    this.nextFilterId = 0
    this.filters = []
  }

  connectedCallback () {
    super.connectedCallback(STYLE)

    this.videoWidth = parseInt(this.getAttribute("width") || "1280")
    this.videoHeight = parseInt(this.getAttribute("height") || "720")

    this.wrapper = Element(`<div class="wrapper"></div>`)
    this.shadow.appendChild(this.wrapper)

    this.videoCanvas = Element(
      `<video-canvas width="${this.videoWidth}" height="${this.videoHeight}">
       </video-canvas>
      `
    )
    this.wrapper.appendChild(this.videoCanvas)

    this.imageProcessor = Element(
      `<image-processor width="${this.videoWidth}" height="${this.videoHeight}">
       </image-processor>
      `
    )
    this.wrapper.appendChild(this.imageProcessor)

    this.controls = Element(`<con-trols></con-trols>`)
    this.wrapper.appendChild(this.controls)

    this.controls.setFilters(this.filters)

    subscribe(TOPICS.FULLSCREEN_TOGGLE, this.toggleFullscreen.bind(this))
    subscribe(TOPICS.PARAMS_UPDATE, this.paramValueUpdateHandler.bind(this))

    // Create an audio buffer for realtime sampling.
    this.audioBuffer = new Uint8Array(this.videoCanvas.audioAnalyser.fftSize)

    // Set and publish the initial filters state.
    this.setFilterPreset("Fine Trip")

    // Start processing frames.
    requestAnimationFrame(this.processFrame.bind(this))
  }

  processFrame () {
    const { loudness, samples } = getAudioParams(
      this.videoCanvas.audioAnalyser,
      this.audioBuffer,
      this.videoWidth
    )
    const imageData = this.videoCanvas.captureFrame()
    this.imageProcessor.process(imageData, { loudness, samples })
    requestAnimationFrame(this.processFrame.bind(this))
  }

  getNextFilterId () {
    // Return a monotonically increasing integer to serve as filter ID.
    this.nextFilterId += 1
    return this.nextFilterId
  }

  addFilter (filterName, filterParamsObj, inhibitPublish = false) {
    // Add the filter along with a unique ID and increment nextFilterId.
    const filterId = this.nextFilterId
    this.filters.push([ filterId, filterName, filterParamsObj ])
    this.nextFilterId += 1
    if (!inhibitPublish) {
      publish(TOPICS.FILTERS_UPDATED, this.filters)
    }
  }

  setFilterPreset (presetName) {
    this.filters = []
    const filters = FILTER_PRESETS[presetName]
    const lastI = filters.length - 1
    filters.forEach(([ name, paramsObj ], i) => {
      // Inhibit publish until the last one.
      this.addFilter(name, paramsObj, i !== lastI)
    })
  }

  async toggleFullscreen () {
    if (document.fullscreenElement !== null) {
      document.exitFullscreen()
    } else {
      this.wrapper.requestFullscreen()
    }
  }

  paramValueUpdateHandler ([ filterIdx, name, value ]) {
    let evalResult
    try {
      evalResult = parseInt(eval(value))
    } catch (e) {
    }
    if (!(typeof evalResult === "number") || Number.isNaN(evalResult)) {
      console.warn(`eval did not yield number on: ${value}`)
      return
    }
    this.filters[filterIdx][2][name] = evalResult
  }

}


customElements.define("gritty-viddy", GrittyViddy)
