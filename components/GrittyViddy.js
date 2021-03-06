
import Base from "./Base.js"
import Controls from "./Controls.js"
import ImageProcessor from "./ImageProcessor.js"
import InputStream from "./InputStream.js"
import { getAudioParams } from "../lib/audio.js"
import CanvasRecorder from "../lib/canvasRecorder.js"
import { TOPICS } from "../lib/constants.js"
import { Element } from "../lib/domHelpers.js"
import { publish, subscribe } from "../lib/pubSub.js"
import { getFilterById } from "../lib/utils.js"


const STYLE = `
  .wrapper {
    position: relative;
  }

  input-stream {
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


export default class GrittyViddy extends Base {
  async connectedCallback () {
    super.connectedCallback(STYLE)

    this.videoWidth = parseInt(this.getAttribute("width") || "1280")
    this.videoHeight = parseInt(this.getAttribute("height") || "720")
    const noGPU = this.hasAttribute("no-gpu")

    this.wrapper = Element(`<div class="wrapper"></div>`)
    this.shadow.appendChild(this.wrapper)

    this.controls = Element(`<con-trols></con-trols>`)
    this.wrapper.appendChild(this.controls)

    this.inputStream = Element(
      `<input-stream width="${this.videoWidth}"
                     height="${this.videoHeight}">
       </input-stream>
      `
    )
    this.shadow.append(this.inputStream)

    // Initialize the ImageProcessor.
    this.imageProcessor = Element(
      `<image-processor ${noGPU ? "no-gpu " : ""}
                        width="${this.videoWidth}" height="${this.videoHeight}">
       </image-processor>
      `
    )
    this.wrapper.appendChild(this.imageProcessor)

    // Initialize the canvas recorder.
    this.recorder = new CanvasRecorder(
      this.imageProcessor.canvas,
      this.inputStream.audioTrack,
    )

    subscribe(TOPICS.FULLSCREEN_TOGGLE, this.toggleFullscreen.bind(this))
    subscribe(TOPICS.RECORD_START, () => this.recorder.start())
    subscribe(TOPICS.RECORD_STOP, () => this.recorder.stop())

    // Start processing frames.
    requestAnimationFrame(this.processFrame.bind(this))
  }

  processFrame () {
    const { loudness, samples } = getAudioParams(
      this.inputStream.audioAnalyser,
      this.videoWidth
    )
    const imageData = this.inputStream.captureFrame()
    this.imageProcessor.process(imageData, { loudness, samples })
    requestAnimationFrame(this.processFrame.bind(this))
  }

  getNextFilterId () {
    // Return a monotonically increasing integer to serve as filter ID.
    this.nextFilterId += 1
    return this.nextFilterId
  }

  async toggleFullscreen () {
    if (document.fullscreenElement !== null) {
      document.exitFullscreen()
    } else {
      this.wrapper.requestFullscreen()
    }
  }
}


customElements.define("gritty-viddy", GrittyViddy)
