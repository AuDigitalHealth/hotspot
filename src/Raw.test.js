import React from 'react'
import { shallow } from 'enzyme'
import Highlight from 'react-highlight'

import Raw from './Raw.js'

describe('Raw', () => {
  it('should render JSON correctly', () => {
    const props = {
      content: '{ "cat": [ "dog", "catdog" ] }',
      format: 'json',
      onError: jest.fn(),
    }
    const wrapper = shallow(<Raw {...props} />)
    expect(wrapper.find(Highlight).children()).toMatchSnapshot()
    expect(props.onError).not.toHaveBeenCalled()
  })

  // We can't currently test this, as XSLTProcessor is not supported within
  // JSDOM.
  // it('should render XML correctly', () => {
  //   const props = {
  //     content: '<cat><dog><catdog /></dog></cat>',
  //     format: 'xml',
  //     onError: jest.fn(),
  //   }
  //   const wrapper = mount(<Raw {...props} />)
  //   expect(wrapper.find(Highlight).children()).toMatchSnapshot()
  //   expect(props.onError).not.toHaveBeenCalled()
  // })
})
