
export default function Animator ({stepsPerCycle, oneShot}) {
  let stepsPerHalfCycle = stepsPerCycle / 2
  let progressStepSize = 1 / stepsPerHalfCycle
  let stepDir = 1
  let stepNum = 0
  let progress = 0

  function stepPingPong () {
    // Step the animation sequence to gradually move progress from 0.0 to 1.0
    // and back to 0.0 in increments of progressStepSize to create a ping-pong
    // animation effect.
    if (stepDir === 1) {
      stepNum += 1
      if (stepNum >= stepsPerHalfCycle) {
        stepDir = -1
      } else {
        // Constrain max progress to 1 in the event that a mid-animation
        // step change causes it to overflow.
        progress = Math.min(progress + progressStepSize, 1)
      }
    } else {
      stepNum -= 1
      if (stepNum === 0) {
        stepDir = 1
      } else {
        // Constrain min progress to 0 in the event that a mid-animation
        // step change causes it to underflow.
        progress = Math.max(progress - progressStepSize, 0)
      }
    }
  }

  function stepOneShot () {
    if (progress === 1) {
      throw "One-shot has already completed"
    }
    // Step the animation sequence to gradually move progress from 0.0 to 1.0 in
    // increments of progressStepSize.
    progress = Math.min(progress + progressStepSize, 1)
    // Return a Boolean indicate whether the one-shot animation is done.
    return progress === 1
  }

  function updateStepsPerCycle (stepsPerCycle) {
    stepsPerHalfCycle = stepsPerCycle / 2
    progressStepSize = 1 / stepsPerHalfCycle
  }

  function linearInterpolate (a, b) {
    // Return the interpolated A -> B value based on the current progress.
    return a + (b - a) * progress
  }

  return {
    linearInterpolate,
    updateStepsPerCycle,
    step: oneShot ? stepOneShot : stepPingPong,
  }
}
