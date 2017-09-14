import { OpOutcomeError } from '../errorTypes.js'
import { oidPattern } from './common.js'

export const extractRawXmlMetadata = async raw => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, 'application/xml')
  return extractXmlMetadata(doc)
}

export const extractXmlMetadata = async doc => {
  const metadata = {}
  // For the purposes of a display title, prefer title over name over resource
  // type.
  const resource = doc.querySelector(':root') || doc
  const name = resource.querySelector(':scope > name')
  const title = resource.querySelector(':scope > title')
  metadata.resourceType = resource ? resource.nodeName : undefined
  metadata.title = title
    ? title.getAttribute('value')
    : name ? name.getAttribute('value') : metadata.resourceType
  const url = resource.querySelector(':scope > url')
  metadata.url = url ? url.getAttribute('value') : undefined
  const version = resource.querySelector(':scope > version')
  metadata.version = version ? version.getAttribute('value') : undefined
  const publisher = resource.querySelector(':scope > publisher')
  metadata.publisher = publisher ? publisher.getAttribute('value') : undefined
  const status = resource.querySelector(':scope > status')
  metadata.status = status ? status.getAttribute('value') : undefined
  // Get an OID value, if there is one in the `identifier` element.
  const identifierSystem = resource.querySelector(':scope > identifier system')
  const identifierValue = resource.querySelector(':scope > identifier value')
  if (
    identifierSystem &&
    identifierSystem.getAttribute('value') === 'urn:ietf:rfc:3986' &&
    identifierValue &&
    identifierValue.getAttribute('value').match(oidPattern)
  ) {
    metadata.oid = oidPattern.exec(identifierValue.getAttribute('value'))[1]
  }
  // Get the narrative.
  const narrative = resource.querySelector(':scope > text div')
  // Serialize the narrative XML back out to a plain string.
  if (narrative) {
    const serializer = new XMLSerializer()
    metadata.narrative = serializer.serializeToString(narrative)
  }
  if (metadata.resourceType === 'ValueSet') {
    // Use the `url` element as the ValueSet URI if the resource is a ValueSet.
    metadata.valueSetUri = metadata.url
    // Note the presence of an expansion.
    const expansion = resource.querySelector(':scope > expansion')
    metadata.expansion = expansion || undefined
  } else if (metadata.resourceType === 'CodeSystem') {
    // Use the `valueSet` element as the ValueSet URI if the resource is a
    // CodeSystem.
    const valueSet = resource.querySelector(':scope > valueSet')
    metadata.valueSetUri = valueSet ? valueSet.getAttribute('value') : undefined
  }
  // Save the whole resource if this is a Bundle.
  if (metadata.resourceType === 'Bundle') {
    metadata.bundle = resource
  }

  return metadata
}

export const rawFromXmlResource = node =>
  new XMLSerializer().serializeToString(node)

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

export const extractEntriesFromXmlBundle = async bundle => {
  const entryElements = bundle.querySelectorAll(':scope entry')
  const entries = []
  console.log(entryElements)
  for (const entryElement of entryElements) {
    const resource = entryElement.querySelector(':scope resource *')
    const fullUrl = entryElement.querySelector(':scope fullUrl')
    entries.push({
      resource,
      fullUrl: fullUrl ? fullUrl.getAttribute('value') : undefined,
    })
  }
  return entries
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
