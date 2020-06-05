
export const TOPICS = Object.freeze(
  Object.fromEntries(
    [
      "FULLSCREEN_TOGGLE",
      "PARAMS_UPDATE",
      "REMOVE_FILTER",
      "MOVE_FILTER_UP",
      "MOVE_FILTER_DOWN",
      "FILTERS_UPDATED",
    ].map(x => [ x, x ])
  )
)

const TOPIC_SUBSCRIBERS_MAP = new Map(
  Object.keys(TOPICS).map(x => [ x, [] ])
)


export const subscribe = (topic, subscriber) =>
  TOPIC_SUBSCRIBERS_MAP.get(topic).push(subscriber)

export async function publish (topic, payload) {
  for (let subscriber of TOPIC_SUBSCRIBERS_MAP.get(topic)) {
    subscriber(payload)
  }
}
