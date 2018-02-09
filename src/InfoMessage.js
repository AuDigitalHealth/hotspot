import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './css/InfoMessage.css'

var HtmlToReactParser = require('html-to-react').Parser

// Renders a standard Info message
class InfoMessage extends Component {
  static propTypes = {
    info: PropTypes.shape({
      message: PropTypes.string,
      messages: PropTypes.array,
    }),
  }

  render() {
    const { message, messages } = this.props
    let output = ''
    if (message) {
      output = '<p>' + message + '</p>'
    } else if (messages && messages.length > 0) {
      output += '<ul>'
      for (var i in messages) {
        output += '<li>' + messages[i] + '</li>'
      }
      output += '</ul>'
    }
    if (output) {
      return (
        <div className="info info-box">
          <strong>Info</strong>
          {new HtmlToReactParser().parse(output)}
        </div>
      )
    } else {
      return null
    }
  }
}

export default InfoMessage
