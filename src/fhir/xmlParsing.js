import { OpOutcomeError } from '../errorTypes.js'

export const extractXMLMetadata = async raw => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, 'application/xml')
  const metadata = {}
  // For the purposes of a display title, prefer title over name over resource
  // type.
  const resource = doc.querySelector(':root')
  const name = doc.querySelector(':root > name')
  const title = doc.querySelector(':root > title')
  metadata.resourceType = resource ? resource.nodeName : undefined
  metadata.title = title
    ? title.getAttribute('value')
    : name ? name.getAttribute('value') : metadata.resourceType
  const url = doc.querySelector(':root > url')
  metadata.url = url ? url.getAttribute('value') : undefined
  const version = doc.querySelector(':root > version')
  metadata.version = version ? version.getAttribute('value') : undefined
  // Get the narrative.
  const narrative = doc.querySelector(':root > text div')
  // Serialize the narrative XML back out to a plain string.
  if (narrative) {
    const serializer = new XMLSerializer()
    metadata.narrative = serializer.serializeToString(narrative)
  }
  if (metadata.resourceType === 'ValueSet') {
    // Use the `url` element as the ValueSet URI if the resource is a ValueSet.
    metadata.valueSetUri = metadata.url
    // Note the presence of an expansion.
    const expansion = doc.querySelector(':root > expansion')
    metadata.expansion = expansion || undefined
  } else if (metadata.resourceType === 'CodeSystem') {
    // Use the `valueSet` element as the ValueSet URI if the resource is a
    // CodeSystem.
    const valueSet = doc.querySelector(':root > valueSet')
    metadata.valueSetUri = valueSet ? valueSet.getAttribute('value') : undefined
  }

  return metadata
}

export const extractCodesFromXMLExpansion = async expansion => {
  const contains = expansion.querySelectorAll('contains')
  const codes = []
  for (const code of contains) {
    const elements = [
      'system',
      'code',
      'display',
      'abstract',
      'inactive',
      'version',
    ]
    const extracted = {}
    for (const element of elements) {
      const found = code.querySelector(element)
      if (found) {
        extracted[element] = found.getAttribute('value')
      }
    }
    codes.push(extracted)
  }
  return codes
}

export const opOutcomeFromXmlResponse = raw => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, 'application/xml')
  const resource = doc.querySelector(':root')
  if (resource.nodeName !== 'OperationOutcome') return null
  // We only ever look at the first issue described within an OperationOutcome
  // resource.
  const issue = doc.querySelector(':root > issue')
  if (!issue) return null
  const elements = [
    'severity',
    'code',
    'details',
    'diagnostics',
    'location',
    'expression',
  ]
  const extracted = {}
  for (const element of elements) {
    const found = issue.querySelector(element)
    if (found) {
      extracted[element] = found.getAttribute('value')
    }
  }
  return new OpOutcomeError(extracted)
}
