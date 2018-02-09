export const oidPattern = /urn:oid:([\d.]+)/
const paramPattern = '(\\?|\\&|)@@param_name@@=[^?&]+[&?]{0,1}'

// Returns true of the supplied path component of a URL contains the provided pattern.
export const matchesPath = (path, pattern) => {
  return path.match(new RegExp(pattern)) !== null
}

// Adds the provided suffix to the path component of a URL.
export const addPathSuffix = (path, suffix) => {
  if (suffix && suffix !== '') {
    return path.replace(/[/]+$/, '') + '/' + suffix.replace(/^[/]+/, '')
  }
  return path
}

// Returns true if the supplied query component of a URL contains a `@@param_name@@`
// parameter.
export const containsParam = (query, param) => {
  return (
    query.match(
      new RegExp(paramPattern.replace('@@param_name@@', param), 'g'),
    ) !== null
  )
}

// Removes any `@@param_name@@` parameters from the query component of a URL.
export const removeParam = (query, param) => {
  const trailingPattern = /(\?|&)$/
  return query
    .replace(
      new RegExp(paramPattern.replace('@@param_name@@', param), 'g'),
      '$1',
    )
    .replace(trailingPattern, '')
}

// Adds any `@@param_name@@` parameters to the query component of a URL.
export const addParam = (query, param, value) => {
  var output = '' + query
  if (value !== undefined && value !== null) {
    output += output === '' ? '?' : '&'
    output += param + '=' + value
  }
  return output
}

// Returns the value of the provided param name from the supplied query component of a URL
export const getParam = (query, param) => {
  if (containsParam(query, param)) {
    return query
      .match(new RegExp(paramPattern.replace('@@param_name@@', param)))[0]
      .replace(/^.*[&?]*[^=]+=([^?&]+)[&?]{0,1}.*/, '$1')
  }
  return null
}
