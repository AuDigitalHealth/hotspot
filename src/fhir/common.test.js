import {
  matchesPath,
  addPathSuffix,
  containsParam,
  removeParam,
  addParam,
} from './common.js'

describe('matchesPath', () => {
  const positives = [
    { path: 'http://xyz.123.ab/fred', pattern: '.*' },
    {
      path: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem',
      pattern: '/CodeSystem[/]{0,1}$',
    },
    {
      path: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem/',
      pattern: '/CodeSystem[/]{0,1}$',
    },
    { path: '/CodeSystem', pattern: '/CodeSystem[/]{0,1}$' },
    { path: '/CodeSystem/', pattern: '/CodeSystem[/]{0,1}$' },
    { path: '/SomeCodeSystem/$expand', pattern: 'CodeSystem/\\$expand$' },
  ]
  for (const positive of positives) {
    it(`should return truthy for "${JSON.stringify(positive)}"`, () => {
      expect(matchesPath(positive.path, positive.pattern)).toBeTruthy()
    })
  }
  const negatives = [
    { path: '', pattern: '/CodeSystem/$' },
    {
      path: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem',
      pattern: '/CodeSystem/$',
    },
    {
      path: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem/',
      pattern: '/CodeSystem$',
    },
    { path: '/ValueSet', pattern: '/CodeSystem[/]{0,1}$' },
    { path: '/ConceptMap/', pattern: '/CodeSystem[/]{0,1}$' },
    { path: '/SomeCodeSystem/$expand', pattern: '/CodeSystem/\\$expand$' },
  ]
  for (const negative of negatives) {
    it(`should return falsy for "${JSON.stringify(negative)}"`, () => {
      expect(matchesPath(negative.path, negative.pattern)).toBeFalsy()
    })
  }
})

describe('addPathSuffix', () => {
  const expectations = [
    {
      path: 'http://xyz.123.ab/fred',
      suffix: 'barney',
      expectation: 'http://xyz.123.ab/fred/barney',
    },
    {
      path: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem',
      suffix: '/$expand',
      expectation: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem/$expand',
    },
    {
      path: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem/',
      suffix: '/$expand',
      expectation: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem/$expand',
    },
    {
      path: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem/',
      suffix: '//$expand',
      expectation: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem/$expand',
    },
    {
      path: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem',
      suffix: '',
      expectation: 'http://ontoserver.csiro.au/stu3-latest/CodeSystem',
    },
  ]
  for (const expection in expectations) {
    it(`should return "${expectations[expection].expectation}" for "${
      expectations[expection].path
    }" + "${expectations[expection].suffix}"`, () => {
      expect(
        addPathSuffix(
          expectations[expection].path,
          expectations[expection].suffix,
        ),
      ).toEqual(expectations[expection].expectation)
    })
  }
})

describe('containsParam', () => {
  const positives = [
    '?_format=html',
    '?url:below=http://snomed.info&_format=html',
    '?_elements=name,url&_format=html&url:below=http://snomed.info',
    '?_format=html&name:contains=edu',
  ]
  for (const positive of positives) {
    it(`should return truthy for "${positive}"`, () => {
      expect(containsParam(positive, '_format')).toBeTruthy()
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
      expect(containsParam(negative, '_format')).toBeFalsy()
    })
  }
})

describe('removeParam', () => {
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
      expect(removeParam(expectation, '_format')).toEqual(
        expectations[expectation],
      )
    })
  }
})

describe('addParam', () => {
  const expectations = [
    {
      query: '?123=xyz',
      paramName: 'barney',
      paramValue: 'legend',
      expectation: '?123=xyz&barney=legend',
    },
    {
      query: '?123=xyz',
      paramName: 'barney',
      paramValue: ['legend', 'champion'],
      expectation: '?123=xyz&barney=legend,champion',
    },
    {
      query: '?123=xyz',
      paramName: 'barney',
      paramValue: null,
      expectation: '?123=xyz',
    },
    {
      query: '?123=xyz',
      paramName: 'barney',
      paramValue: '',
      expectation: '?123=xyz&barney=',
    },
    {
      query: '',
      paramName: 'barney',
      paramValue: 'legend',
      expectation: '?barney=legend',
    },
  ]
  for (const expection in expectations) {
    it(`should return "${expectations[expection].expectation}" for "${
      expectations[expection].query
    }" + "${expectations[expection].paramName}" = "${
      expectations[expection].paramValue
    }"`, () => {
      expect(
        addParam(
          expectations[expection].query,
          expectations[expection].paramName,
          expectations[expection].paramValue,
        ),
      ).toEqual(expectations[expection].expectation)
    })
  }
})
