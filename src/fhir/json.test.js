import fs from 'fs'
import _ from 'lodash'

import { extractRawJsonMetadata } from './json.js'

describe('extractRawJsonMetadata', () => {
  const jsonResources = [
    [
      'NCTS-Complete-Code-System-2.0.0.json',
      {
        resourceType: 'StructureDefinition',
        title: 'NCTS Complete Code System',
        url:
          'http://ns.electronichealth.net.au/fhir/StructureDefinition/ncts/profile/CodeSystem/complete-code-system/2.0.0',
        version: '2.0.0',
      },
    ],
    [
      'v3-EducationLevel.json',
      {
        resourceType: 'CodeSystem',
        title: 'v3 Code System EducationLevel',
        url: 'http://hl7.org/fhir/v3/EducationLevel',
        version: '2016-03-23',
        valueSetUri: 'http://hl7.org/fhir/ValueSet/v3-EducationLevel',
      },
    ],
    [
      'nhin-purposeofuse.json',
      {
        resourceType: 'ValueSet',
        title: 'NHIN PurposeOfUse',
        url: 'http://hl7.org/fhir/ValueSet/nhin-purposeofuse',
        version: '2.0',
        valueSetUri: 'http://hl7.org/fhir/ValueSet/nhin-purposeofuse',
      },
    ],
    [ 'CodeSystem-search.json', { resourceType: 'Bundle', title: 'Bundle' } ],
  ]
  for (const resource of jsonResources) {
    it(`should extract correct metadata for ${resource[0]}`, async () => {
      const raw = fs.readFileSync('test/' + resource[0], { encoding: 'utf-8' })
      return extractRawJsonMetadata(raw).then(metadata => {
        expect(
          _.pick(
            metadata,
            'resourceType',
            'title',
            'url',
            'version',
            'valueSetUri'
          )
        ).toEqual(resource[1])
      })
    })
  }
})
