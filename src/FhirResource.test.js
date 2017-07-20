import fs from 'fs'
import _ from 'lodash'

import FhirResource from './FhirResource.js'

describe('FhirResource', () => {
  const jsonResources = [
    [
      'NCTS-Complete-Code-System-2.0.0.json',
      {
        title: 'NCTS Complete Code System',
        url:
          'http://ns.electronichealth.net.au/fhir/StructureDefinition/ncts/profile/CodeSystem/complete-code-system/2.0.0',
        version: '2.0.0',
      },
    ],
    [
      'v3-EducationLevel.json',
      {
        title: 'v3 Code System EducationLevel',
        url: 'http://hl7.org/fhir/v3/EducationLevel',
        version: '2016-03-23',
      },
    ],
    [ 'CodeSystem-search.json', { title: 'Bundle' } ],
  ]
  for (const resource of jsonResources) {
    it(`should extract correct metadata for ${resource[0]}`, async () => {
      const raw = fs.readFileSync('test/' + resource[0], { encoding: 'utf-8' })
      return FhirResource.extractJSONMetadata(raw).then(metadata => {
        expect(_.pick(metadata, 'title', 'url', 'version')).toEqual(resource[1])
      })
    })
  }

  // Can't currently test XML resources, due to the lack of a level 3
  // implementaton of the W3C DOM API in Node.
})
