import RemoteFhirResource from './RemoteFhirResource.js'
import moxios from 'moxios'
import sinon from 'sinon'
import { equal, notEqual } from 'assert'

describe('mocking fhir resource requests', function() {
  describe('across entire suite', function() {
    let onRejected
    let onFulfilled

    beforeEach(function() {
      // import and pass your custom axios instance to this method
      moxios.install()
      onFulfilled = sinon.spy()
      onRejected = sinon.spy()
    })

    afterEach(function() {
      // import and pass your custom axios instance to this method
      moxios.uninstall()
    })

    it('304 throws expected error', function(done) {
      let rfr = new RemoteFhirResource()
      rfr
        .getResource({
          path: '/ValueSet/my-resource',
          query: '',
          fhirServer: 'http://ontoserver.csiro.au/stu3-latest',
          fhirVersion: '3.0.1',
          narrativeStyles: '/agency-narrative.css',
          pathPrefix: '/fhir',
        })
        .then(onFulfilled, onRejected)

      moxios.wait(function() {
        let request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 304,
            responseText: '',
          })
          .then(function() {
            equal(onFulfilled.called, false)
            equal(onRejected.called, true)
            // Assert the error thrown contains the expected message
            notEqual(
              ('' + onRejected.getCall(0).args[0]).indexOf(
                'Server returned a 304 status, without a FHIR resource in the response body. ' +
                  'Hotspot does not support loading FHIR resources from the browser cache',
              ),
              -1,
            )
            done()
          })
      })
    })

    it('a fhir resource request includes the no-cache headers', function(done) {
      let rfr = new RemoteFhirResource()
      rfr
        .getResource({
          path: '/ValueSet/my-resource',
          query: '',
          fhirServer: 'http://ontoserver.csiro.au/stu3-latest',
          fhirVersion: '3.0.1',
          narrativeStyles: '/agency-narrative.css',
          pathPrefix: '/fhir',
        })
        .then(onFulfilled, onRejected)

      moxios.wait(function() {
        let request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 200,
            headers: {
              'Content-Type': 'application/fhir+json',
            },
            response: {},
          })
          .then(function() {
            equal(onFulfilled.called, true)
            equal(onRejected.called, false)
            equal(request.headers.Pragma, 'no-cache')
            equal(request.headers['Cache-Control'], 'no-cache')
            done()
          })
      })
    })
  })
})
