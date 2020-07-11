
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


export function getAudioParams (audioAnalyser, numSamples) {
  // Create an audio buffer for realtime sampling.
  let audioBuffer = new Uint8Array(audioAnalyser.fftSize)
  audioAnalyser.getByteTimeDomainData(audioBuffer)
  audioBuffer = getTriggeredAudioBuffer(audioBuffer)

  // Calculate the average loudness as a float in the range 0 - 1
  const positiveAudioSamples = audioBuffer.filter(x => x > 128)
  const normalizedLoudness = !positiveAudioSamples.length
    ? 0
    : positiveAudioSamples.reduce((acc, x) => acc + (x - 128) / 128, 0) / positiveAudioSamples.length

  // Scale the audio samples to floats in the range 0 - 1 and scale the number of samples
  // to numSamples.
  const normalizedSamples = new Array(...audioBuffer).map(x => x / 255)
  let scaledNormalizedSamples = []
  const idxFactor = Math.floor(normalizedSamples.length / numSamples)
  for (let i = 0; i < numSamples; i += 1) {
    scaledNormalizedSamples.push(normalizedSamples[i * idxFactor])
  }

  return {
    loudness: normalizedLoudness,
    samples: scaledNormalizedSamples
  }
}
