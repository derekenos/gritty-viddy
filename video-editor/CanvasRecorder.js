
export default class CanvasRecorder extends MediaRecorder {
  constructor (canvas, audioTrack = null, frameRate = 30, mimeType = "video/webm") {
    const stream = canvas.captureStream(frameRate)

    if (audioTrack) {
      stream.addTrack(audioTrack)
    }

    super(stream, { mimeType })
    this.chunks = []

    this.addEventListener("dataavailable", e => this.chunks.push(e.data))
    this.addEventListener("stop", e => {
      const blob = new Blob(this.chunks, { type: this.mimeType })
      this.chunks = []
      window.open(URL.createObjectURL(blob))
    })
  }
}
