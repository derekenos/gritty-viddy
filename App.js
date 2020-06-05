
import Base from "./Base.js"
import VideoCanvas from "./VideoCanvas.js"
import ImageProcessor from "./ImageProcessor.js"
import Controls from "./Controls.js"
import { TOPICS, subscribe } from "./pubSub.js"
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


export default class GrittyViddy extends Base {
  constructor () {
    super()
    this.filters = [
      [ "brightness", { factor: 1 } ],
    ]
  }

  connectedCallback () {
    super.connectedCallback(STYLE)

    const width = parseInt(this.getAttribute("width") || "1280")
    const height = parseInt(this.getAttribute("height") || "720")

    this.wrapper = Element(`<div class="wrapper"></div>`)
    this.shadow.appendChild(this.wrapper)

    this.videoCanvas = Element(
      `<video-canvas width="${width}" height="${height}">
       </video-canvas>
      `
    )
    this.wrapper.appendChild(this.videoCanvas)

    this.imageProcessor = Element(
      `<image-processor width="${width}" height="${height}">
       </image-processor>
      `
    )
    // Add the filters to the image processor.
    this.filters.forEach(([ filterName, filterParams ]) => {
      this.imageProcessor.addFilter(filterName, filterParams)
    })
    this.wrapper.appendChild(this.imageProcessor)

    this.controls = Element(`<con-trols></con-trols>`)
    this.controls.setFilters(this.filters)

    subscribe(TOPICS.FULLSCREEN_TOGGLE, this.toggleFullscreen.bind(this))

    this.wrapper.appendChild(this.controls)

    // Start processing frames.
    requestAnimationFrame(this.processFrame.bind(this))
  }

  processFrame () {
    if (this.videoCanvas.ready && this.imageProcessor.ready) {
      const imageData = this.videoCanvas.captureFrame()
      this.imageProcessor.process(imageData)
    }
    requestAnimationFrame(this.processFrame.bind(this))
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
