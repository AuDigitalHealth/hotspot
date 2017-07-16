import React from 'react'
import { shallow } from 'enzyme'

import Narrative from './Narrative.js'

describe('Narrative', () => {
  it('should render correctly', () => {
    const props = {
      fhirServer: 'http://hl7.org/STU3',
      content: '<a href="http://somedomain.com/some/thing">Link</a>',
      stylesPath: '/some-styles.css',
    }
    const wrapper = shallow(<Narrative {...props} />)
    wrapper.setState({ styles: 'strong { font-weight: 500; }' })
    expect(wrapper).toMatchSnapshot()
  })

  describe('sanitization', () => {
    it('should filter out a tag not in the whitelist', () => {
      const props = {
        fhirServer: 'http://hl7.org/fhir/STU3',
        content: '<div><audio src="music.mp3"/></div>',
      }
      const wrapper = shallow(<Narrative {...props} />)
      const contentDiv = wrapper.find('.narrative-content').first()
      const content = contentDiv.prop('dangerouslySetInnerHTML')['__html']
      expect(content).toBe('<div></div>')
    })

    it('should allow data URLs', () => {
      const props = {
        fhirServer: 'http://hl7.org/fhir/STU3',
        content: '<div><img src="data:image/gif;base64,c29tZWNyYXAK" /></div>',
      }
      const wrapper = shallow(<Narrative {...props} />)
      const contentDiv = wrapper.find('.narrative-content').first()
      const content = contentDiv.prop('dangerouslySetInnerHTML')['__html']
      expect(content).toBe(props.content)
    })

    it('should filter out an onClick attribute', () => {
      const props = {
        fhirServer: 'http://hl7.org/fhir/STU3',
        content:
          '<div><a href="http://somedomain.com/some/thing" onclick="javascript:alert(\'Boo!\')">Link</a></div>',
      }
      const wrapper = shallow(<Narrative {...props} />)
      const contentDiv = wrapper.find('.narrative-content').first()
      const content = contentDiv.prop('dangerouslySetInnerHTML')['__html']
      expect(content).toBe(
        '<div><a href="http://somedomain.com/some/thing">Link</a></div>'
      )
    })
  })

  describe('href translation', () => {
    const getLinkHref = wrapper => {
      const contentDiv = wrapper.find('.narrative-content').first()
      const contentDoc = new DOMParser().parseFromString(
        contentDiv.prop('dangerouslySetInnerHTML')['__html'],
        'application/xml'
      )
      const link = contentDoc.querySelector('a')
      return link.href
    }

    it('should not translate an absolute href', () => {
      const props = {
        fhirServer: 'http://hl7.org/fhir/STU3',
        content: '<a href="http://somedomain.com/some/thing">Link</a>',
      }
      const wrapper = shallow(<Narrative {...props} />)
      expect(getLinkHref(wrapper)).toBe('http://somedomain.com/some/thing')
    })

    it('should not translate a protocol-relative href', () => {
      const props = {
        fhirServer: 'http://hl7.org/fhir/STU3',
        content: '<a href="//somedomain.com/some/thing">Link</a>',
      }
      const wrapper = shallow(<Narrative {...props} />)
      expect(getLinkHref(wrapper)).toBe('//somedomain.com/some/thing')
    })

    it('should translate a root-relative href', () => {
      const props = {
        fhirServer: 'http://hl7.org/fhir/STU3',
        content: '<a href="/some/thing">Link</a>',
      }
      const wrapper = shallow(<Narrative {...props} />)
      expect(getLinkHref(wrapper)).toBe('http://hl7.org/some/thing')
    })

    it('should translate a filename href', () => {
      const props = {
        fhirServer: 'http://hl7.org/fhir/STU3',
        content: '<a href="something.html">Link</a>',
      }
      const wrapper = shallow(<Narrative {...props} />)
      expect(getLinkHref(wrapper)).toBe(
        'http://hl7.org/fhir/STU3/something.html'
      )
    })

    it('should translate a relative href (.)', () => {
      const props = {
        fhirServer: 'http://hl7.org/fhir/STU3',
        content: '<a href="./something">Link</a>',
      }
      const wrapper = shallow(<Narrative {...props} />)
      expect(getLinkHref(wrapper)).toBe('http://hl7.org/fhir/STU3/something')
    })

    it('should translate a relative href (..)', () => {
      const props = {
        fhirServer: 'http://hl7.org/fhir/STU3',
        content: '<a href="../something">Link</a>',
      }
      const wrapper = shallow(<Narrative {...props} />)
      expect(getLinkHref(wrapper)).toBe('http://hl7.org/fhir/something')
    })

    it('should not translate a fragment', () => {
      const props = {
        fhirServer: 'http://hl7.org/fhir/STU3',
        content: '<a href="#something">Link</a>',
      }
      const wrapper = shallow(<Narrative {...props} />)
      expect(getLinkHref(wrapper)).toBe('about:blank#something')
    })
  })
})
