export const oidPattern = /urn:oid:([\d.]+)/
const formatPattern = /(\?|&|)_format=[^?&]+[&?]{0,1}/g

// Returns true if the supplied query component of a URL contains a `_format`
// parameter.
export const containsFormatParam = query => query.match(formatPattern)

// Removes any `_format` parameters from the query component of a URL.
export const removeFormatParam = query => {
  const trailingPattern = /(\?|&)$/
  return query.replace(formatPattern, '$1').replace(trailingPattern, '')
}
