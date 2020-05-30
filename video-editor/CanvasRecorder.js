
export default class CanvasRecorder extends MediaRecorder {
  constructor (canvas, audioTrack = null, frameRate = 30, mimeType = "video/webm") {
    // Firefox will throw an error if the context isn't initialized before
    // calling captureStream(), so let's do that.
    canvas.getContext("2d")
    const stream = canvas.captureStream(frameRate)

    if (audioTrack) {
      stream.addTrack(audioTrack)
    }

    super(stream, { mimeType })
    this.chunks = []

    this.addEventListener("dataavailable", e => this.chunks.push(e.data))
    this.addEventListener("stop", e => {
      // Get the data blob, clear the chunks, and create/click-on an anchor
      // element to download the blob.
      const blob = new Blob(this.chunks, { type: this.mimeType })
      this.chunks = []
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `recording_${ Date.now() }`
      a.click()
    })
  }
}
