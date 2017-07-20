import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highlight from 'react-highlight'
import beautify from 'vkbeautify'

import 'highlight.js/styles/docco.css'

// Renders the raw content of an XML or JSON FHIR resource, pretty-printed and
// with syntax highlighting.
class Raw extends Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    format: PropTypes.oneOf([ 'json', 'xml' ]).isRequired,
    onError: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {}
    if (props.content && props.format) {
      try {
        this.state = {
          ...this.state,
          prettyContent: Raw.prettifyContent(props.content, props.format),
        }
      } catch (error) {
        if (props.onError) {
          props.onError(error)
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.content && nextProps.format) {
      try {
        this.setState(() => ({
          prettyContent: Raw.prettifyContent(
            nextProps.content,
            nextProps.format
          ),
        }))
      } catch (error) {
        if (this.props.onError) {
          this.props.onError(error)
        }
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.content !== nextProps.content ||
      this.props.format !== nextProps.format ||
      this.state.prettyContent !== nextState.prettyContent
    )
  }

  render() {
    const { format } = this.props
    const { prettyContent } = this.state

    return (
      <div className='raw'>
        <Highlight className={format}>
          {prettyContent}
        </Highlight>
      </div>
    )
  }

  static prettifyContent(content, format) {
    if (format === 'json') {
      return Raw.prettifyJSONContent(content)
    } else if (format === 'xml') {
      return Raw.prettifyXMLContent(content)
    } else {
      throw new Error('Unsupported content type.')
    }
  }

  static prettifyJSONContent(content) {
    return JSON.stringify(JSON.parse(content), null, 2)
  }

  static prettifyXMLContent(content) {
    return beautify.xml(content, 4)
  }
}

export default Raw
