
export function getFilterById (filters, filterId) {
  // Return the filter array with the specified ID and its index within filters.
  let filtersWithIdx = filters
    .map((filter, i) => [ filter, i ])
    .filter(([ [ id ], i ]) => id === filterId)
  if (filtersWithIdx.length === 0) {
    console.warn(`No matching filter for idx: ${filterId}`)
    return [ null, null ]
  }
  const [ filter, i ] = filtersWithIdx[0]
  return [ filter, i ]
}
