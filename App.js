
import Base from "./Base.js"
import VideoCanvas from "./VideoCanvas.js"
import ImageProcessor from "./ImageProcessor.js"
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
  }
`


export default class GrittyViddy extends Base {
  connectedCallback () {
    super.connectedCallback(STYLE)

    const width = parseInt(this.getAttribute("width") || "1280")
    const height = parseInt(this.getAttribute("height") || "720")

    const wrapper = Element(`<div class="wrapper"></div>`)
    this.shadow.appendChild(wrapper)

    this.videoCanvas = Element(
      `<video-canvas width="${width}" height="${height}">
       </video-canvas>
      `
    )
    wrapper.appendChild(this.videoCanvas)

    this.imageProcessor = Element(
      `<image-processor width="${width}" height="${height}">
       </image-processor>
      `
    )
    wrapper.appendChild(this.imageProcessor)

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
}


customElements.define("gritty-viddy", GrittyViddy)
