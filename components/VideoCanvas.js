
import Base from "./Base.js"
import { Element } from "../lib/domHelpers.js"


const STYLE = `
  video {
    visibility: hidden;
  }

  canvas {
    display: none;
  }
`


export default class VideoCanvas extends Base {
  connectedCallback () {
    super.connectedCallback(STYLE)

    this.deviceId = this.getAttribute("deviceId") || undefined
    this.width = parseInt(this.getAttribute("width") || "1280")
    this.height = parseInt(this.getAttribute("height") || "720")

    this.video = Element(
      `<video width="${this.width}" height="${this.height}" autoplay="true" muted>
       </video>
      `
    )
    this.shadow.appendChild(this.video)

    this.canvas = Element(
      `<canvas width="${this.width}" height="${this.height}">
       </canvas>
      `
    )
    this.shadow.appendChild(this.canvas)
    this.canvasCtx = this.canvas.getContext("2d")

    // Start the audio/video input stream.
    const constraints = {
      audio: true,
      video: {
        width: { ideal: this.width },
        height: { ideal: this.height },
      }
    }
    if (this.deviceId !== undefined) {
        constraints.video.deviceId = { exact: this.deviceId }
    }
    navigator
      .mediaDevices.getUserMedia(constraints)
      .then(stream => this.shadow.querySelector("video").srcObject = stream)

    // Get the audio stream.
    // from: https://stackoverflow.com/a/52400024/2327940
    const audioCtx = new AudioContext()
    const sourceNode = audioCtx.createMediaElementSource(this.video)

    // Create an audioAnalyzer node for reading audio data.
    this.audioAnalyser = audioCtx.createAnalyser()
    sourceNode.connect(this.audioAnalyser)
    const dest = audioCtx.createMediaStreamDestination()
    this.audioAnalyser.connect(dest)

    // Uncomment to hear the audio in realtime.
    //sourceNode.connect(audioCtx.destination);
    this.audioTrack = dest.stream.getAudioTracks()[0]
  }

  captureFrame () {
    // Capture a video frame onto othe canvas and return the corresponding ImageData
    // object.
    const { video, canvas, canvasCtx } = this
    canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvasCtx.getImageData(0, 0, canvas.width, canvas.height)
  }
}


customElements.define("video-canvas", VideoCanvas)
