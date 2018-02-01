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
        publisher: 'Australian Digital Health Agency',
        resourceStatus: 'draft',
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
        resourceStatus: 'active',
        publisher: 'HL7, Inc',
      },
    ],
    [
      'v2-preferred-method-of-contact.json',
      {
        resourceType: 'CodeSystem',
        title: 'v2 Preferred Method of Contact',
        url: 'http://hl7.org/fhir/v2/0185',
        version: '2.8.2',
        valueSetUri: 'http://hl7.org/fhir/ValueSet/v2-0185',
        resourceStatus: 'active',
        publisher: 'HL7, Inc',
        oid: '2.16.840.1.113883.18.98',
      },
    ],
    [
      'action-participant-type.json',
      {
        resourceType: 'ValueSet',
        title: 'ActionParticipantType',
        url: 'http://hl7.org/fhir/ValueSet/action-participant-type',
        version: '3.0.1',
        valueSetUri: 'http://hl7.org/fhir/ValueSet/action-participant-type',
        resourceStatus: 'draft',
        publisher: 'HL7 (FHIR Project)',
        oid: '2.16.840.1.113883.4.642.3.794',
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
        resourceStatus: 'active',
        publisher: 'Nationwide Health Information Network (NHIN)',
      },
    ],
    ['CodeSystem-search.json', { resourceType: 'Bundle', title: 'Bundle' }],
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
            'valueSetUri',
            'publisher',
            'resourceStatus',
            'oid',
          ),
        ).toEqual(resource[1])
      })
    })
  }
})
