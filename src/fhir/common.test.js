import { containsFormatParam, removeFormatParam } from './common.js'

describe('containsFormatParam', () => {
  const positives = [
    '?_format=html',
    '?url:below=http://snomed.info&_format=html',
    '?_elements=name,url&_format=html&url:below=http://snomed.info',
    '?_format=html&name:contains=edu',
  ]
  for (const positive of positives) {
    it(`should return truthy for "${positive}"`, () => {
      expect(containsFormatParam(positive)).toBeTruthy()
    })
  }
  const negatives = [
    '',
    '?',
    '?url:below=http://snomed.info',
    '?_elements=name,url&url:below=http://snomed.info',
    '?name:contains=edu',
  ]
  for (const negative of negatives) {
    it(`should return falsy for "${negative}"`, () => {
      expect(containsFormatParam(negative)).toBeFalsy()
    })
  }
})

describe('removeFormatParam', () => {
  const expectations = {
    '?_format=html': '',
    '?_format=html&': '',
    '?_format=html&_format=json': '',
    '': '',
    '?': '',
    '?url:below=http://snomed.info&_format=html':
      '?url:below=http://snomed.info',
    '?_elements=name,url&_format=html&url:below=http://snomed.info':
      '?_elements=name,url&url:below=http://snomed.info',
    '?_elements=name,url&_format=html&_format=json&url:below=http://snomed.info':
      '?_elements=name,url&url:below=http://snomed.info',
    '?_format=html&name:contains=edu': '?name:contains=edu',
  }
  for (const expectation in expectations) {
    it(`should return "${
      expectations[expectation]
    }" for "${expectation}"`, () => {
      expect(removeFormatParam(expectation)).toEqual(expectations[expectation])
    })
  }
})
