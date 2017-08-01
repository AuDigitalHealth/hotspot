export const valueSetExpansionPath = (valueSetUri, fhirVersion) => {
  if (!valueSetUri) {
    return null
  }
  const fhirMajorVersion = parseInt(fhirVersion.split('.')[0], 10)
  const uriParam = fhirMajorVersion >= 3 ? 'url' : 'identifier'
  const escapedUri = encodeURIComponent(valueSetUri)
  return `/ValueSet/$expand?${uriParam}=${escapedUri}`
}

export const codeSystemSearchPath = codeSystemUri => {
  return `/CodeSystem?url=${codeSystemUri}`
}

export const lookupPath = (system, code, version) =>
  version
    ? `/CodeSystem/$lookup?system=${system}&version=${version}&code=${code}`
    : `/CodeSystem/$lookup?system=${system}&code=${code}`
