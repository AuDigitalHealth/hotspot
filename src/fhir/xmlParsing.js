export const extractXMLMetadata = async raw => {
  try {
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
      metadata.expansion = doc.querySelector(':root > expansion')
        ? true
        : undefined
    } else if (metadata.resourceType === 'CodeSystem') {
      // Use the `valueSet` element as the ValueSet URI if the resource is a
      // CodeSystem.
      const valueSet = doc.querySelector(':root > valueSet')
      metadata.valueSetUri = valueSet
        ? valueSet.getAttribute('value')
        : undefined
    }

    return metadata
  } catch (error) {
    throw new Error(
      `There was a problem parsing the XML FHIR resource: "${error.message}"`
    )
  }
}
