import { processPathRoutes } from './pathRoutes.js'

// Tests that when we provide a location, with a pathname that matches a rule in the pathRoute config, that the
// corresponding rule is applied to the location object that is subsequently returned from processPathRoutes().
// The intent is that the client is rerouted with the returned location
// Actions that can be applied to a match include:
//  - addSuffix: Append a suffix to the provided pathname (NOTE: it will add a slash between the existing path and suffix)
//  - removeParams: If the provided location.search contains a parameter listed in 'removeParams', it will be removed from the returned location.search
//  - addParams: If the provided location.search does not contain the params defined in "addParams", they will be added to the returned location.search
describe('processPathRoutes', () => {
  const testConfig = [
    { matchPattern: '.*', removeParams: ['_format'] },
    { matchPattern: '.*/test00$', removeParams: ['meh'] },
    { matchPattern: '.*/test01$', addSuffix: 'barney' },
    { matchPattern: '.*/test02$', removeParams: ['meh', 'dog'] },
    {
      matchPattern: '.*/test03$',
      addParams: {
        _elements: ['id', 'name', 'color'],
        colors: ['red', 'green', 'blue'],
      },
    },
    { matchPattern: '.*/test04$', addParams: { ninjaTurtle: 'leonardo' } },
  ]
  const expectations = [
    {
      location: {
        pathname: 'http://xyz.123.ab/fred/test00',
        search: '?_format=json&meh=123',
      },
      expectation: { pathname: 'http://xyz.123.ab/fred/test00', search: '' },
    },
    {
      location: {
        pathname: 'http://xyz.123.ab/fred/test01',
        search: '?$blah=whatever&_format=json&sun=moon',
      },
      expectation: {
        pathname: 'http://xyz.123.ab/fred/test01/barney',
        search: '?$blah=whatever&sun=moon',
      },
    },
    {
      location: {
        pathname: 'http://xyz.123.ab/fred/test02',
        search: '?dog=woof&_format=json?meh=123&mum=dad',
      },
      expectation: {
        pathname: 'http://xyz.123.ab/fred/test02',
        search: '?mum=dad',
      },
    },
    {
      location: { pathname: 'http://xyz.123.ab/fred/test03', search: '' },
      expectation: {
        pathname: 'http://xyz.123.ab/fred/test03',
        search: '?_elements=id,name,color&colors=red,green,blue',
      },
    },
    {
      location: {
        pathname: 'http://xyz.123.ab/fred/test04',
        search: '?bestCharacterOf=90s',
      },
      expectation: {
        pathname: 'http://xyz.123.ab/fred/test04',
        search: '?bestCharacterOf=90s&ninjaTurtle=leonardo',
      },
    },
  ]

  for (const expection in expectations) {
    it(`should return "${JSON.stringify(
      expectations[expection].expectation,
    )}" for 'location':"${JSON.stringify(
      expectations[expection].location,
    )}", 'config':"${JSON.stringify(testConfig)}"`, () => {
      let output = processPathRoutes(
        expectations[expection].location,
        testConfig,
      )
      expect(output.pathname).toEqual(
        expectations[expection].expectation.pathname,
      )
      expect(output.search).toEqual(expectations[expection].expectation.search)
    })
  }
})
