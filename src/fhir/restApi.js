export const valueSetExpansionPath = (
  valueSetUri,
  fhirVersion,
  { pathPrefix = '' } = {},
) => {
  if (!valueSetUri) {
    return null
  }
  const fhirMajorVersion = parseInt(fhirVersion.split('.')[0], 10)
  const uriParam = fhirMajorVersion >= 3 ? 'url' : 'identifier'
  const escapedUri = encodeURIComponent(valueSetUri)
  return `${pathPrefix}/ValueSet/$expand?${uriParam}=${escapedUri}&_count=100`
}

export const codeSystemSearchPath = (
  codeSystemUri,
  { pathPrefix = '' } = {},
) => {
  return `${pathPrefix}/CodeSystem?url=${codeSystemUri}`
}

export const lookupPath = (
  system,
  code,
  { version = null, pathPrefix = '' } = {},
) =>
  version
    ? `${pathPrefix}/CodeSystem/$lookup?system=${system}&version=${version}&code=${code}`
    : `${pathPrefix}/CodeSystem/$lookup?system=${system}&code=${code}`

export const sniffFormat = contentType => {
  // Sniff JSON if the Content-Type header matches:
  // - application/json
  // - application/fhir+json (FHIR STU3)
  // - application/json+fhir (FHIR DSTU2)
  if (
    contentType.match(
      /(application\/json|application\/fhir\+json|application\/json\+fhir)/,
    )
  ) {
    return 'json'
    // Sniff XML if the Content-Type header matches:
    // - text/xml
    // - application/xml
    // - application/fhir+xml (FHIR STU3)
    // - application/json+xml (FHIR DSTU2)
  } else if (
    contentType.match(
      /(text\/xml|application\/xml|application\/fhir\+xml|application\/xml\+fhir)/,
    )
  ) {
    return 'xml'
  } else {
    throw new Error('Could not sniff format as either JSON or XML.')
  }
}

export const translateHref = (href, fhirServer) => {
  if (!href) {
    return ''
  }
  const absolutePattern = /^([a-z]+:){0,1}\/\//
  const rootRelativePattern = /^\//
  const fragmentPattern = /^#/
  if (href.match(absolutePattern)) {
    return href
  } else if (href.match(rootRelativePattern)) {
    const fhirServerUrl = new URL(fhirServer)
    return fhirServerUrl.protocol + fhirServerUrl.hostname + href
  } else if (href.match(fragmentPattern)) {
    return href
  } else {
    return fhirServer + '/' + href
  }
}
