import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highlight from './vendor/highlight'
import beautify from 'vkbeautify'

import './vendor/highlight/css/docco.css'
import './css/Raw.css'

// Renders the raw content of an XML or JSON FHIR resource, pretty-printed and
// with syntax highlighting.
class Raw extends Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    format: PropTypes.oneOf(['json', 'xml']).isRequired,
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
    this.highlightCode = this.highlightCode.bind(this)
  }

  componentDidMount() {
    this.highlightCode()
  }

  componentDidUpdate() {
    this.highlightCode()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.content && nextProps.format) {
      try {
        this.setState(() => ({
          prettyContent: Raw.prettifyContent(
            nextProps.content,
            nextProps.format,
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

  highlightCode() {
    if (this.code) {
      let attMatches = this.code.textContent.match(/"[a-zA-Z0-9-]+"[ ]*:/g)
      if (!attMatches || attMatches.length < 5000) {
        Highlight.highlightBlock(this.code)
      }
    }
  }

  render() {
    const { format } = this.props
    const { prettyContent } = this.state

    return (
      <div className="raw">
        <pre
          className={format}
          ref={el => {
            this.code = el
          }}
        >
          {prettyContent}
        </pre>
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
