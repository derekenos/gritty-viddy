
import Base from "./Base.js"
import VideoCanvas from "./VideoCanvas.js"
import ImageProcessor from "./ImageProcessor.js"
import Controls from "./Controls.js"
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
      [ "brightness", { factor: 1 } ]
    ]
  }

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
    // Add the filters to the image processor.
    this.filters.forEach(([ filterName, filterParams ]) => {
      this.imageProcessor.addFilter(filterName, filterParams)
    })
    wrapper.appendChild(this.imageProcessor)

    this.controls = Element(`<con-trols></con-trols>`)
    this.controls.setFullscreenElement(wrapper)
    this.controls.setFilters(this.filters)
    wrapper.appendChild(this.controls)

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
