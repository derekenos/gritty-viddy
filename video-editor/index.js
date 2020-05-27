
import CanvasRecorder from "./CanvasRecorder.js"
import * as CPU_FILTERS from "./filters.js"
import * as GPU_FILTERS from "./gpuFilters.js"


///////////////////////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////////////////////

const USE_GPU = false
const FILTERS = USE_GPU ? GPU_FILTERS : CPU_FILTERS

const SOURCE_WIDTH = 1280
const SOURCE_HEIGHT = 720

const FINAL_SCALE = USE_GPU ? 1 : 1 / 4
const FINAL_WIDTH = SOURCE_WIDTH * FINAL_SCALE
const FINAL_HEIGHT = SOURCE_HEIGHT * FINAL_SCALE


///////////////////////////////////////////////////////////////////////////////
// Utility Functions
///////////////////////////////////////////////////////////////////////////////

async function initInputStreams () {
  /*
     Start the video and audio streams.
  */
  const video = document.querySelector("video")
  video.srcObject = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: { width: SOURCE_WIDTH, height: SOURCE_HEIGHT },
  })

  // Get the audio stream.
  // from: https://stackoverflow.com/a/52400024/2327940
  const audioCtx = new AudioContext()
  const sourceNode = audioCtx.createMediaElementSource(video)

  // Create an audioAnalyzer node for reading audio data.
  const audioAnalyser = audioCtx.createAnalyser()
  sourceNode.connect(audioAnalyser)
  const dest = audioCtx.createMediaStreamDestination()
  audioAnalyser.connect(dest)

  // Uncomment to hear the audio in realtime.
  //sourceNode.connect(audioCtx.destination);
  const audioTrack = dest.stream.getAudioTracks()[0]

  return { video, audioTrack, audioAnalyser }
}


function initRecordButtonClickHandler (button, recorder) {
  /*
     Enable the record button to start and stop the recorder.
  */
  button.addEventListener("click", e => {
    switch (recorder.state) {
      case "inactive":
        recorder.start()
        e.target.textContent = "Stop Recording"
        break
      case "recording":
        recorder.stop()
        e.target.textContent = "Start Recording"
        break
      default:
        throw new Error(`Unhandled recorder state: ${recorder.state}`)
        break
    }
  })
}


function getTriggeredAudioBuffer (audioBuffer) {
  /*
     Return a subarray of audioBuffer that starts at some detected
     trigger point.
  */
  // Find the index, not greater than TRIGGER_MAX_I, of the first run
  // of samples in audioBuffer that is above TRIGGER_LEVEL for at least
  // TRIGGER_NUM_RISING samples and return an audioBuffer subarray that
  // starts there.
  const TRIGGER_LEVEL = 128
  const TRIGGER_NUM_RISING = 8
  const TRIGGER_MAX_I = 512
  let numRising = 0
  let lastSample = audioBuffer[0]
  for (let i = 1; i < TRIGGER_MAX_I; i += 1) {
    const sample = audioBuffer[i]
    if (sample < lastSample) {
      // Reset the rising counter on any falling edge.
      numRising = 0
    } else if (lastSample > 128 && sample > lastSample) {
      numRising += 1
      if (numRising === TRIGGER_NUM_RISING) {
        audioBuffer = audioBuffer.subarray(i - TRIGGER_NUM_RISING, audioBuffer.length)
        break
      }
    }
    lastSample = sample
  }
  return audioBuffer
}


function getAudioParams (audioAnalyser, audioBuffer) {
  // Get the audio sample data.
  audioAnalyser.getByteTimeDomainData(audioBuffer)
  audioBuffer = getTriggeredAudioBuffer(audioBuffer)

  // Calculate the average loudness as a float in the range 0 - 1
  const positiveAudioSamples = audioBuffer.filter(x => x > 128)
  const normalizedLoudness = !positiveAudioSamples.length
    ? 0
    : positiveAudioSamples.reduce((acc, x) => acc + (x - 128) / 128, 0) / positiveAudioSamples.length
  // Scale the audio samples to floats in the range 0 - 1 and
  const normalizedSamples = new Array(...audioBuffer).map(x => x / 255)
  let scaledNormalizedSamples = []
  const idxFactor = Math.floor(normalizedSamples.length / FINAL_WIDTH)
  for (let i = 0; i < FINAL_WIDTH; i += 1) {
    scaledNormalizedSamples.push(normalizedSamples[i * idxFactor])
  }
  return { normalizedLoudness, scaledNormalizedSamples }
}


function captureVideoFrame (video, canvas) {
  /*
     Capture a video frame onto a canvas and return the corresponding
     ImageData object.
  */
  const ctx = canvas.getContext("2d")
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}


let lastValidCustomFn

function makeCustomFn (innerBody) {
  const f = x => new Function(
    "pixel", "params", "i", "col", "row", "width", "height",
    `let [ r, g, b, a ] = pixel
     ${x}
     return [ r, g, b, a ];
    `
  )
  let customFn
  try {
    customFn = f(innerBody)
    customFn([ 0, 0, 0, 0 ], [], 0, 0, 0, 0, 0)
  } catch (e) {
    return lastValidCustomFn
  }
  lastValidCustomFn = customFn
  return lastValidCustomFn
}

lastValidCustomFn = makeCustomFn("")

function getFilters (audioAnalyser, audioBuffer) {
  // Get audio data that we can use to modify the filter parameters.
  const {
    normalizedLoudness,
    scaledNormalizedSamples
  } = getAudioParams(audioAnalyser, audioBuffer)

  // Define the filter chain.
  const filters = [
    //[ FILTERS.thresholdFilter, [ 255 - normalizedLoudness * 4 * 255 ] ],
    //[ FILTERS.brightnessFilter, [ 0 + normalizedLoudness * 10] ],
    //[ FILTERS.channelFilter, [ 1, 1, 1 ] ],
    //[ FILTERS.colorReducerFilter, [ 0x80 ] ],
    //[ FILTERS.rowBlankerFilter, [ 2 ] ],
    //[ FILTERS.colBlankerFilter, [ 8 ] ],
    //[ FILTERS.colorGainFilter, [ 0, 0, normalizedLoudness * 10 ] ],
    //[ FILTERS.invertFilter, [] ]
    //[ FILTERS.audioPlotFilter, scaledNormalizedSamples ],
    [ makeCustomFn(document.querySelector("textarea").value), [ ] ],
  ]

  return filters
}


function process (audioAnalyser, audioBuffer, video, workCanvas, finalCanvas) {
  /*
     Process a single video frame.
  */
  // Get the current filters state.
  const filters = getFilters(audioAnalyser, audioBuffer)

  // Capture the image data from a single video frame.
  let imageData = captureVideoFrame(video, workCanvas)

  // Apply the filters to the image data.
  imageData = FILTERS.applyFilters(filters, imageData)

  // Write the processed image data to the final canvas.
  finalCanvas.getContext("2d").putImageData(imageData, 0, 0)

  // Repeat on the next animation frame.
  requestAnimationFrame(
    () => process(audioAnalyser, audioBuffer, video, workCanvas, finalCanvas)
  )
}


export async function init () {
  // Start up the video and audio streams and create a buffer to use
  // for sampling the audio.
  const { video, audioTrack, audioAnalyser } = await initInputStreams()
  const audioBuffer = new Uint8Array(audioAnalyser.fftSize)

  // Resize the canvases to their proper dimensions.
  const workCanvas = document.querySelector("canvas#work")
  const finalCanvas = document.querySelector("canvas#final")
  finalCanvas.width = workCanvas.width = FINAL_WIDTH
  finalCanvas.height = workCanvas.height = FINAL_HEIGHT

  // Add final canvas fullscreen button handler.
  document.querySelector("button#fullscreen")
    .addEventListener("click", () => finalCanvas.requestFullscreen())

  // Init the canvas recorder and record button click handler.
  const recorder = new CanvasRecorder(finalCanvas, audioTrack)
  initRecordButtonClickHandler(document.querySelector("button#record"), recorder)

  // Start processing video frames.
  requestAnimationFrame(
    () => process(audioAnalyser, audioBuffer, video, workCanvas, finalCanvas)
  )
}
