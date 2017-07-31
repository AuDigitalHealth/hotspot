import pick from 'lodash.pick'

export const extractJSONMetadata = async parsed => {
  try {
    const metadata = {}
    // For the purposes of a display title, prefer title over name over resource
    // type.
    if (parsed.resourceType) {
      metadata.resourceType = parsed.resourceType
      metadata.title = parsed.resourceType
    }
    if (parsed.name) {
      metadata.title = parsed.name
    }
    if (parsed.title) {
      metadata.title = parsed.title
    }
    if (parsed.url) {
      metadata.url = parsed.url
    }
    if (parsed.version) {
      metadata.version = parsed.version
    }
    // Get the narrative.
    if (parsed.text && parsed.text.div) {
      metadata.narrative = parsed.text.div
    }
    if (metadata.resourceType === 'ValueSet' && metadata.url) {
      // Use the `url` element as the ValueSet URI if the resource is a ValueSet.
      metadata.valueSetUri = metadata.url
    } else if (metadata.resourceType === 'CodeSystem' && parsed.valueSet) {
      // Use the `valueSet` element as the ValueSet URI if the resource is a
      // CodeSystem.
      metadata.valueSetUri = parsed.valueSet
    }
    // Note the presence of an expansion, in the case of a ValueSet.
    if (metadata.resourceType === 'ValueSet' && parsed.expansion) {
      metadata.expansion = parsed.expansion
    }
    return metadata
  } catch (error) {
    throw new Error(
      `There was a problem parsing the JSON FHIR resource: "${error.message}"`
    )
  }
}

export const extractCodesFromJSONExpansion = async expansion => {
  return expansion.contains.map(code =>
    pick(code, 'system', 'code', 'display', 'abstract', 'inactive', 'version')
  )
}
